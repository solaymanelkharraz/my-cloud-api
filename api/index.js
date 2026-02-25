const { success, error } = require('../functions');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const express = require('express');
const morgan  = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS - allow React to talk to this API
// CORS - allow React to talk to this API
app.use(function(req, res, next) {
    // Allows any origin to access the API. For production, you could replace "*" with your frontend's specific URL.
    res.header("Access-Control-Allow-Origin", "*"); 
    
    // Explicitly allow the methods you are using
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    // Explicitly allow the headers your frontend might send
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// --- ALWAYSDATA CONNECTION ---
const db = mysql.createPool({
    connectionLimit: 10, // Allows up to 10 simultaneous connections
    host: 'mysql-jbala.alwaysdata.net', // Look in your Alwaysdata panel
    user: 'jbala',                 // Your Alwaysdata MySQL username
    password: 'sql@2006',          // Your Alwaysdata MySQL password
    database: 'jbala_nodejs'            // Your Alwaysdata Database name          
});

let MembersRouter = express.Router();

MembersRouter.route('/:id')
    // Get member by ID
    .get((req, res) => {
        db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
            if (err) res.json(error(err.message));
            else result[0] != undefined ? res.json(success(result[0])) : res.json(error('Wrong id'));
        });
    })
    // Update member
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
    // Delete member
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
    // Get all members
    .get((req, res) => {
        db.query('SELECT * FROM members', (err, result) => {
            if (err) res.json(error(err.message));
            else res.json(success(result));
        });
    })
    // Add member
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

app.use('/api/v1/members', MembersRouter);

// IMPORTANT FOR VERCEL: Export the app instead of app.listen
module.exports = app;

