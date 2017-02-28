'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const app = express();
require('dotenv').load();
require('./config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/public', express.static('public'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
app.set('views', 'views');

require('./routes.js')(app, passport);

var port = process.env.PORT;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
