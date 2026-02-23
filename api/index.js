const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { success } = require("../functions"); // Note the ../ to go back one folder

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());

// CORS headers (Very important for the View to talk to the API)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/api/v1/somme", (req, res) => {
    let n1 = req.body.n1;
    let n2 = req.body.n2;
    let result = Number(n1) + Number(n2);
    res.json(success("La somme est: " + result));
});

module.exports = app; // Vercel needs this line!