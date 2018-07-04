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
	'database': 'api'
});

// ROUTES
// ============================================================================
app.get('/', (req, res) => {
	res.render('page', { 'title': 'Hello, World!' });
});

// formular til at oprette bruger
app.get('/create-user', (req, res) => {
	res.render('create.ejs', { 'title': 'Create User' });
});

// route til at oprette bruger
app.post('/user', (req, res) => {
	if (!req.body || !req.body.username || !req.body.passphrase)
		throw new Error('Bad request');
	
	const hash = bcrypt.hashSync(req.body.passphrase, 10);

	db.execute('INSERT INTO users SET username = ?, passphrase = ?',
		[req.body.username, hash], (err, rows) => {
			if (err) throw new Error(err);
			res.redirect(`/user/${rows.insertId}`);
		});
});

// læs alle brugere
app.get('/user', (req, res) => {
	db.execute('SELECT * FROM users', (err, rows) => {
		if (err) throw new Error(err);
		res.render('users', { 'title': 'Users', 'users': rows });
	});
});

// læs en bruger
app.get('/user/:userId', (req, res) => {
	db.execute(`
	SELECT users.id AS id, users.username AS username, profiles.firstname AS firstname, profiles.lastname AS lastname,
		CONCAT(profiles.firstname, ' ', profiles.lastname) AS fullname, profiles.address_streetname AS streetname,
		profiles.address_streetnumber AS streetnumber, profiles.address_zipcode AS zipcode, profiles.address_city AS city,
		users.active as active
	FROM users 
	INNER JOIN profiles ON profiles.user_id = users.id
	WHERE users.id = ?`, [req.params.userId], (err, rows) => {
		if (err) throw new Error(err);
		if (rows.length)
			res.render('user', { 'title': rows[0].firstname, 'user': rows[0] });
	});
});

// ret/rediger en bruger
app.patch('/user/:userId', (req, res) => {
	if (req.body) {
		console.log(req.body);
		db.execute(`UPDATE profiles SET firstname = ?, lastname = ?, address_streetname = ?,
								address_streetnumber = ?, address_zipcode = ?, address_city = ? WHERE user_id = ?`,
			[req.body.firstname, req.body.lastname, req.body.streetname, req.body.streetnumber,
			req.body.zipcode, req.body.city, req.body.id], (err) => {
				if (err) throw new Error('Update went badly');
				res.status(200);
				res.end();
			});
	} else
		throw new Error('Missing fields');
});

// route til at aktivere en bruger
app.patch('/user/:userId/activate', (req, res) => {
	db.execute('UPDATE users SET active = 1 WHERE id = ?', [req.params.userId], (err, rows) => {
		if (err) throw new Error('Activation failed');
		res.status(200);
		res.end();
	});
});

// route til at deaktivere en bruger
app.patch('/user/:userId/deactivate', (req, res) => {
	db.execute('UPDATE users SET active = 0 WHERE id = ?', [req.params.userId], (err, rows) => {
		if (err) throw new Error('Deactivation failed');
		res.status(200);
		res.end();
	});
});

// route til at slette en bruger
app.del('/user/:userId', (req, res) => {
	db.execute('DELETE FROM users WHERE id = ?', [req.params.userId], (err, rows) => {
		if (err) throw new Error('Could not delete user');
		res.status(200);
		res.end();
	});
});

// route til 404
app.use((req, res) => {
	res.status(404);
	res.render('404', { 'title': '404: Not Found', 'route': req.url });
});

// route til 500
app.use((error, req, res, next) => {
	res.status(500);
	res.render('500', { 'title': '500: Internal Server Error', 'content': error });
});

// SERVER INIT
// ============================================================================
spdy.createServer(options, app).listen(port, () => {
	process.stdout.write(
		`\x1b[36m${pjson.name} v${pjson.version}\x1b[0m is running on \x1b[36mhttps://localhost:${port}\x1b[0m\n`
	);
});
