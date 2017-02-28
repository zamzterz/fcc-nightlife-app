'use strict';

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const LocationHandler = require('./locationHandler.js');

const root = __dirname + '/views';

const locationHandler = new LocationHandler();

function showActivities(location, res) {
  locationHandler.getNightlifeForLocation(location, (results) => {
    res.render('index.pug', {searchResults: results,
                             searchQuery: location});
  });
}

module.exports = function (app, passport) {
	app.route('/')
		.get((req, res) => {
      if (req.query.location) {
        req.session.location = req.query.location;
        showActivities(req.session.location, res);
      } else if (req.session.location) {
        showActivities(req.session.location, res);
      } else {
        res.render('index.pug');
      }
		});

  app.route('/going')
    .get(ensureLoggedIn('/login'), (req, res) => {
      locationHandler.toggleLocationForUser(req.user.github.id,
                                            req.query.goingTo);
      res.redirect('/');
    });

	app.route('/login')
		.get(function (req, res) {
			res.sendFile('/login.html', {root: root});
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successReturnToOrRedirect: '/',
			failureRedirect: '/login'
		}));
};
