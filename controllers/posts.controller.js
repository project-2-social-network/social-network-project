const mongoose = require("mongoose");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Follow = require("../models/Follow.model");

module.exports.home = (req, res, next) => {
  const currentUser = req.user;

  Follow.find({ follower: currentUser.id }, { following: 1 })
    .then((usersIfollow) => {
      const everyUserPostListPromise = [];

      usersIfollow.forEach((follow) => {
        const userID = follow.following.valueOf();
        everyUserPostListPromise.push(
          Post.find({ creator: userID }).populate("creator")
        );
      });
      everyUserPostListPromise.push(
        Post.find({ creator: currentUser.id }).populate("creator")
      );
      return Promise.all(everyUserPostListPromise).then((everyUserPostList) => {
        const finalList = everyUserPostList.reduce((acc, curr) => {
          return [...acc, ...curr];
        }, []);
        finalList.forEach((post) => {
          if (post.creator) {
            const postCreator = post.creator.id.valueOf();
            post.sameOwner = currentUser.id === postCreator ? true : false;
          }
        });
        const listWithoutDuplicates = [...new Set(finalList)].reverse();
        res.render("home", { listWithoutDuplicates });
      });
    })
    .catch((err) => next(err));
};

module.exports.doCreate = (req, res, next) => {
  const post = req.body;

  if (req.file) {
    post.media = req.file.path;
  }

  Post.create(post)
    .then((postCreated) => {
      res.redirect("home");
    })
    .catch((err) => next(err));
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
