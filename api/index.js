const { success, error } = require('../functions');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const express = require('express');
const morgan  = require('morgan');
const jwt = require('jsonwebtoken'); // 1. Import JWT

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS - allow React to talk to this API
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // Added 'Authorization' to allowed headers so React can send the token
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// --- ALWAYSDATA CONNECTION POOL ---
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'mysql-jbala.alwaysdata.net', // Look in your Alwaysdata panel
    user: 'jbala',                 // Your Alwaysdata MySQL username
    password: 'sql@2006',          // Your Alwaysdata MySQL password
    database: 'jbala_nodejs'            // Your Alwaysdata Database name  
});

// --- SECURITY LOGIC (ATELIER 4) ---
const SECRET = 'fullstack'; // The secret key to sign tokens

// Route: Login to get a token
app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    
    // Test user requested by the TP
    if (username === 'admin' && password === '123456') {
        const user = { id: 1, username: 'admin' };
        // Generate the token
        const token = jwt.sign({ user }, SECRET, { expiresIn: '1h' });
        res.json(success({ token: token }));
    } else {
        res.json(error('Identifiants invalides !'));
    }
});

// Middleware: The "Bouncer" that checks the token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1]; // Extract token from "Bearer <token>"
        
        jwt.verify(token, SECRET, (err, data) => {
            if (err) {
                res.sendStatus(403); // Token invalid or expired
            } else {
                req.user = data; // Save user data for the request
                next(); // Let them pass
            }
        });
    } else {
        res.sendStatus(403); // No token provided
    }
}

// --- MEMBERS ROUTER (Protected) ---
let MembersRouter = express.Router();

MembersRouter.route('/:id')
    .get((req, res) => {
        db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
            if (err) res.json(error(err.message));
            else result[0] != undefined ? res.json(success(result[0])) : res.json(error('Wrong id'));
        });
    })
    .put((req, res) => {
        if (req.body.name) {
            db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                if (err) res.json(error(err.message));
                else if (result[0] != undefined) {
                    db.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                        if (err) res.json(error(err.message));
                        else if (result[0] != undefined) res.json(error('same name'));
                        else {
                            db.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                                if (err) res.json(error(err.message));
                                else res.json(success('Modification avec succes !!!'));
                            });
                        }
                    });
                } else res.json(error('Wrong id'));
            });
        } else res.json(error('no name value'));
    })
    .delete((req, res) => {
        db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
            if (err) res.json(error(err.message));
            else if (result[0] != undefined) {
                db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, result) => {
                    if (err) res.json(error(err.message));
                    else res.json(success('Suppression avec succes!!!'));
                });
            } else res.json(error('Wrong id'));
        });
    });

MembersRouter.route('/')
    .get((req, res) => {
        db.query('SELECT * FROM members', (err, result) => {
            if (err) res.json(error(err.message));
            else res.json(success(result));
        });
    })
    .post((req, res) => {
        if (req.body.name) {
            db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                if (err) res.json(error(err.message));
                else if (result[0] != undefined) res.json(error('name already taken'));
                else {
                    db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {
                        if (err) res.json(error(err.message));
                        else {
                            db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                                if (err) res.json(error(err.message));
                                else res.json(success({ id: result[0].id, name: result[0].name }));
                            });
                        }
                    });
                }
            });
        } else res.json(error('no name value'));
    });

// IMPORTANT: We inject `verifyToken` right here!
// Now EVERY route inside MembersRouter requires a valid JWT.
app.use('/api/v1/members', verifyToken, MembersRouter);

module.exports = app;