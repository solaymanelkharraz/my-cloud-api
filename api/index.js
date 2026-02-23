const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { success } = require("../functions");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Create the router exactly as shown in the Vercel PDF
const CalculRouter = express.Router();

CalculRouter.route("/somme").post((req, res) => {
    let n1 = req.body.n1;
    let n2 = req.body.n2;
    let r = Number(n1) + Number(n2);
    res.json(success("la somme de " + n1 + " et " + n2 + " est: " + r));
});

// IMPORTANT: Link the router to the path the HTML uses
app.use("/api/v1", CalculRouter);

module.exports = app;