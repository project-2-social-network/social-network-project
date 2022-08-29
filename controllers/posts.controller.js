const User = require("../models/User.model");
const Post = require("../models/Post.model");

const mongoose = require("mongoose");

module.exports.home = (req, res, next) => {
    const user = req.user;
    
    Post.find()
    .populate('creator')
    .then((posts) => {
      posts.forEach((post) => {
        if (post.creator) {
          const postCreator = post.creator.id.valueOf()
          post.sameOwner = user.id === postCreator ? true : false;
        }
     
      })

      posts.reverse()
      res.render('home', { user, posts })
    })
    .catch((err) => next(err))
};

module.exports.doCreate = (req, res, next) => {
  const post = req.body;
  
  Post.create(post)
  .then((postCreated) => {
    res.redirect('home')
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
      next(createError(404, "Post not found"));
    });
};