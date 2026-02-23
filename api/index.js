const express = require("express");
const bodyParser = require("body-parser");
const { success } = require("../functions");

const app = express();
app.use(bodyParser.json());

// CORS is required so your Vercel URL can talk to your API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// A simple test route to see if the API is working at all
app.get("/api", (req, res) => {
    res.send("API is awake and running!");
});

// This matches the path in your index.html fetch('/api/v1/somme')
app.post("/api/v1/somme", (req, res) => {
    const { n1, n2 } = req.body;
    const r = Number(n1) + Number(n2);
    res.json(success("La somme est: " + r));
});

module.exports = app;