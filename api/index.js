const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { success } = require("../functions"); // Go up one folder to find functions.js

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());

// IMPORTANT: This allows your HTML/React view to talk to this API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// The Sum route
app.post("/api/v1/somme", (req, res) => {
    const n1 = req.body.n1;
    const n2 = req.body.n2;
    const r = Number(n1) + Number(n2);
    res.json(success("La somme de " + n1 + " et " + n2 + " est : " + r));
});

module.exports = app; // Required for Vercel