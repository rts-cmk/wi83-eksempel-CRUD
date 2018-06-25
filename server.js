// IMPORTS
// ============================================================================
const express = require('express');
const spdy = require('spdy');
const pjson = require('./package.json');
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const logger = require('morgan');
const bcrypt = require('bcrypt');
const fs = require('fs');
const port = process.env.port || 3000;
const options = {
	'key': fs.readFileSync('ssl/localhost-privkey.pem'),
	'cert': fs.readFileSync('ssl/localhost-cert.pem')
};

// SERVER
// ============================================================================
const app = express();

// CONFIG
// ============================================================================
app.set('views', 'views');           // In which directory are views located
app.set('view engine', 'ejs');       // Which view engine to use
app.use(express.static('./public')); // Where are static files located

app.use(bodyParser.json());          // Accept JSON objects in requests
// Accept extended form elements in requests
app.use(bodyParser.urlencoded({
	'extended': true
}));

// Setup session handling
app.use(session({
	'resave': false,
	'saveUninitialized': true,
	'secret': 'really secret stuffs'
}));

app.use(logger('dev'));						// Setup console logging of route events

// Setup database connection
const db = mysql2.createConnection({
	'host': 'localhost',
	'user': 'root',
	'password': 'root',
	'database': 'kodebase'
});

// ROUTES
// ============================================================================
app.get('/', (req, res) => {
	res.render('page', { 'title': 'Hello, World!' });
});

app.use((req, res) => {
	res.status(404);
	res.render('404', { 'title': '404: Not Found' });
});

app.use((error, req, res, next) => {
	res.status(500);
	res.render('500', { 'title': '500: Internal Server Error' });
});

// SERVER INIT
// ============================================================================
spdy.createServer(options, app).listen(port, () => {
	process.stdout.write(
		`\x1b[36m${pjson.name} v${pjson.version}\x1b[0m is running on \x1b[36mhttps://localhost:${port}\x1b[0m\n`
	);
});
