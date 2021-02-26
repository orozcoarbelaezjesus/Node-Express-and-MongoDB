const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Leaders = require("../models/leaders");
const authenticate = require("../authenticate");
const cors = require("./cors");

const leaderRouter = express.Router({mergeParams: true});

leaderRouter.use(bodyParser.json());

// File app.js
// app.use("/leaders", leaderRouter);
// app.use("/leaders/:leaderId", leaderRouter);

leaderRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus = 200 })
.get(cors.cors, (req,res,next) => {
        if(req.baseUrl === "/leaders"){
            Leaders.find({})
                .then((leaders) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leaders);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            Leaders.findById(req.params.leaderId)
                .then((leader) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                    console.log(req.params.leaderId);
                }, (err) => next(err))
                .catch((err) => next(err));
        }
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if(req.baseUrl === "/leaders"){
            Leaders.create(req.body)
                .then((leader) => {
                    console.log("Leader Created ", leader);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            res.end("Post operation not supported on " + req.baseUrl);
        }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res, next) => {
    res.statusCode = 403;
        if(req.baseUrl === "/leaders"){
            res.end("PUT operation not supported on " + req.baseUrl);
        } else {
            Leaders.findByIdAndUpdate(req.params.leaderId, {
                $set: req.body
            }, { new: true })
                .then((leader) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                }, (err) => next(err))
                .catch((err) => next(err))
        }
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res, next) => {
    if (req.baseUrl === "/leaders") {
        Leaders.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    } else {
        Leaders.findByIdAndRemove(req.params.leaderId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    }
});

module.exports = leaderRouter;