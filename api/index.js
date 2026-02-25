const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { success, error } = require("../functions");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data - Initial Members (Teacher's PDF Page 1)
let members = [
    { id: 1, name: 'PHP' },
    { id: 2, name: 'JavaScript' },
    { id: 3, name: 'Java' }
];

// CORS - Essential for React to talk to Vercel
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Helper: Auto-increment ID (Teacher's PDF Page 4 logic)
const createID = () => {
    return members.length > 0 ? members[members.length - 1].id + 1 : 1;
};

// --- ROUTER FOR MEMBERS ---
const MembersRouter = express.Router();

MembersRouter.route('/')
    .get((req, res) => {
        res.json(success(members));
    })
    .post((req, res) => {
        if (req.body.name) {
            let sameName = members.find(m => m.name === req.body.name);
            if (sameName) {
                res.json(error('name already taken'));
            } else {
                let member = { id: createID(), name: req.body.name };
                members.push(member);
                res.json(success(member));
            }
        } else {
            res.json(error('no name provided'));
        }
    });

MembersRouter.route('/:id')
    .get((req, res) => {
        let member = members.find(m => m.id == req.params.id);
        member ? res.json(success(member)) : res.json(error('wrong id'));
    })
    .delete((req, res) => {
        let index = members.findIndex(m => m.id == req.params.id);
        if (index !== -1) {
            members.splice(index, 1);
            res.json(success(members));
        } else {
            res.json(error('wrong id'));
        }
    })
    .put((req, res) => {
        let index = members.findIndex(m => m.id == req.params.id);
        if (index !== -1) {
            let sameName = members.find(m => m.name === req.body.name);
            if (sameName) {
                res.json(error('same name'));
            } else {
                members[index].name = req.body.name;
                res.json(success(true));
            }
        } else {
            res.json(error('wrong id'));
        }
    });

// --- ATELIER 1: CALCULATOR ROUTE ---
app.post("/api/somme", (req, res) => {
    const { n1, n2 } = req.body;
    const r = Number(n1) + Number(n2);
    res.json(success("La somme est: " + r));
});

// Mount the Members Router (Teacher's PDF Page 2)
app.use("/api/v1/members", MembersRouter);

module.exports = app;