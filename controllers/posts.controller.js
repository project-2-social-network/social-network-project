const User = require("../models/User.model");
const Post = require("../models/Post.model");

const mongoose = require("mongoose");

module.exports.home = (req, res, next) => {
    const user = req.user;

    Post.find()
    .then((posts) => {
        
        res.render('home', { user, posts })
    })
    .catch((err) => next(err))
};

module.exports.doCreate = (req, res, next) => {
  const post = req.body;
  console.log(post);
  
  Post.create(post)
  .then((postCreated) => {
    console.log('post creado', postCreated);
    return Post.find()
  })
  .then((posts) => {
    res.render('home', { posts })
  })
  .catch((err) => next(err))
};