const express = require('express');
const logger = require('morgan');
const routes = require('./src/routes/routes');
const { error404Handler, errorHandler } = require('./src/middleware');
const cors = require('cors');
//const path = require('path');

// Initializations
const app = express();
const pool = require('./src/services/mysql');

pool.pool
	.getConnection()
	.then(() => console.log('connected ok'))
	.catch((err) => console.log(err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('combined'));

app.use('/uploads', express.static('uploads'));
//app.use(express.static('public'));

// Routes
app.use('/', routes);

// Error handlers
app.use(error404Handler);
app.use(errorHandler);

module.exports = app;
