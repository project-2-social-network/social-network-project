const User = require("../models/User.model");
const Post = require("../models/Post.model");

const mongoose = require("mongoose");

module.exports.home = (req, res, next) => {
    const user = req.user;

    Post.find()
    .then((posts) => {
      posts.forEach((post) => {
        return post.sameOwner = user.id === post.creator.valueOf() ? true : false;
      })
      res.render('home', { user, posts })
    })
    .catch((err) => next(err))
};

module.exports.doCreate = (req, res, next) => {
  const post = req.body;
  const user = req.user;
  
  Post.create(post)
  .then((postCreated) => {
    return Post.find()
  })
  .then((posts) => {
    posts.forEach((post) => {
      return post.sameOwner = user.id === post.creator.valueOf() ? true : false;
    })
    res.render('home', { posts })
  })
  .catch((err) => next(err))
};

module.exports.doDelete = (req, res, next) => {
  const { id } = req.params;
  Post.findByIdAndDelete(id)
    .then((post) => {
      res.status(204).send(post);
    })
    .catch((err) => {
      console.error(err);
      next(createError(404, "Post not found"));
    });
};