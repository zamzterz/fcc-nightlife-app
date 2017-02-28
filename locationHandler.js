'use strict';
const Users = require('./models/users.js');
const yelp = require('node-yelp');

const yelpClient = yelp.createClient({
  oauth: {
    'consumer_key': process.env.YELP_CONSUMER_KEY,
    'consumer_secret': process.env.YELP_CONSUMER_SECRET,
    'token': process.env.YELP_TOKEN,
    'token_secret': process.env.YELP_TOKEN_SECRET
  }
});

function LocationHandler () {
	this.getNightlifeForLocation = (location, callback) => {
    yelpClient.search({
      category_filter: 'nightlife',
      location: location
    }).then(function (yelpData) {
      Users.aggregate([
        { $match: {} },
        { $project: { activities: 1 } },
        { $unwind: '$activities' },
        { $group: {
            _id: '$activities',
            count: { $sum: 1 }
          }
        }
      ], function(err, goingToResults) {
        if (err) {throw err;}

        let goingTo = {};
        for (let i = 0; i < goingToResults.length; ++i) {
          goingTo[goingToResults[i]._id] = goingToResults[i].count
        }

        let filteredResults = yelpData.businesses.map((business) => {
          let goingCount = 0;
          if (goingTo[business.id] !== undefined) {
            goingCount = goingTo[business.id];
          }
          return {
            'yelp_id': business.id,
            'image_url': business.image_url,
            'name': business.name,
            'snippet_text': business.snippet_text,
            'url': business.url,
            'going_count': goingCount
          };
        });

        callback(filteredResults);
      });
    });
  }

  this.toggleLocationForUser = (userId, location) => {
    // insert new activity if not exists
    Users.findOneAndUpdate({
        'github.id': userId,
        'activities': {$nin: [location]}
      }, {$push: {'activities': location}},
      {new: true},
      (err, updated) => {
        if (!updated) {
          // remove old activity if it exists
          Users.findOneAndUpdate({
              'github.id': userId,
              'activities': {$in: [location]}
            }, {$pull: {'activities': location}}
          ).exec();
        }
      }
    );
  }
}


module.exports = LocationHandler;
