const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Promotions = require("../models/promotions");
const authenticate = require("../authenticate");
const promoRouter = express.Router({ mergeParams: true });
const cors = require("./cors");

promoRouter.use(bodyParser.json());

// File app.js
// app.use("/promotions", promoRouter);
// app.use("/promotions/:promoId", promoRouter);

promoRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus = 200 })
    .get(cors.cors, (req, res, next) => {
        if (req.baseUrl === "/promotions") {
            Promotions.find({})
                .then((promotions) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotions);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            Promotions.findById(req.params.promoId)
                .then((promotion) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                    console.log(req.params.promoId);
                }, (err) => next(err))
                .catch((err) => next(err));
        }
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.baseUrl === "/promotions") {
            Promotions.create(req.body)
                .then((promotion) => {
                    console.log("Promotion Created ", promotion);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            res.end("POST operation not supported on " + req.baseUrl);
        }
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        if (req.baseUrl === "/promotions") {
            res.end("PUT operation not supported on " + req.baseUrl);
        } else {
            Promotions.findByIdAndUpdate(req.params.promoId, {
                $set: req.body
            }, { new: true })
                .then((promotion) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                }, (err) => next(err))
                .catch((err) => next(err))
        }
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.baseUrl === "/promotions") {
            Promotions.remove({})
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            Promotions.findByIdAndRemove(req.params.promoId)
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
        }
    });

module.exports = promoRouter;