const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('User')
      .populate('Dishes')
      .then((favorites) => {
        favoritesList = favorites.filter(favorite => favorite.user._id == req.user.id);

        if (favoritesList) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favoritesList);
        }
        else {
          var err = new Error('You haven’t added any dish');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
      Favorites.find({})
        .populate('User')
        .populate('Dishes')
        .then((favorites) => {
          var user;
          if (favorites)
            user = favorites.filter(favorite => favorite.user._id.toString() === req.user.id.toString())[0];
          if (!user)
            user = new Favorites({ user: req.user.id });
          for (let i of req.body) {
            if (user.dishes.find((d_id) => {
              if (d_id._id) {
                return d_id._id.toString() === i._id.toString();
              }
            }))
              continue;
            user.dishes.push(i._id);
          }
          user.save()
            .then((userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favourites Created");
            }, (err) => next(err))
            .catch((err) => next(err));

        })
        .catch((err) => next(err));
    })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('User')
      .populate('Dishes')
      .then((favorites) => {
        var favToRemove;
        if (favorites) {
          favToRemove = favorites.filter(fav => favorites.user._id.toString() === req.user.id.toString())[0];
        }
        if (favToRemove) {
          favToRemove.remove()
            .then((result) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(result);
            }, (err) => next(err));

        } else {
          var err = new Error('You do not have any favourites');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('User')
      .populate('Dishes')
      .then((favorites) => {
        if (favorites) {
          const favs = favorites.filter(favorite => favorite.user._id.toString() === req.user.id.toString())[0];
          const dish = favs.dishes.filter(dish => dish.id === req.params.dishId)[0];
          if (dish) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          } else {
            var err = new Error('You do not have dish ' + req.params.dishId);
            err.status = 404;
            return next(err);
          }
        } else {
          var err = new Error('You do not have any favorites');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
      Favorites.find({})
        .populate('User')
        .populate('Dishes')
        .then((favorites) => {
          var user;
          if (favorites)
            user = favorites.filter(favorite => favorite.user._id.toString() === req.user.id.toString())[0];
          if (!user)
            user = new Favorites({ user: req.user.id });
          if (!user.dishes.find((d_id) => {
            if (d_id._id)
              return d_id._id.toString() === req.params.dishId.toString();
          }))
            user.dishes.push(req.params.dishId);

          user.save()
            .then((userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favorites Created");
            }, (err) => next(err))
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites/:dishId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('User')
      .populate('Dishes')
      .then((favorites) => {
        var user;
        if (favorites)
          user = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
        if (user) {
          user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
          user.save()
            .then((result) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(result);
            }, (err) => next(err));

        } else {
          var err = new Error('You do not have any favorites');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;