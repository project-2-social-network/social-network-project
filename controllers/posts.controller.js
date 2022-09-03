const mongoose = require("mongoose");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Follow = require("../models/Follow.model");
const Like = require("../models/Like.model");
const Comment = require("../models/Comment.model");

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
        res.render("posts/home", { listWithoutDuplicates });
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

module.exports.doLike = (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user;

  Like.findOne({like: id})
  .then((likeFound) => {
    if (likeFound) {
      Like.findOneAndDelete({ userWhoLikes: currentUser.id, like: id })
        .then((likeDeleted) => {
          res.status(204).send(likeDeleted);
        })
        .catch((err) => next(err));
    } else {
      Like.create({ userWhoLikes: currentUser.id, like: id })
        .then((likeCreated) => {
          res.status(204).send(likeCreated);
        })
        .catch((err) => next(err));
    }
  })
  .catch((err) => next(err))
};

module.exports.likeList = (req, res, next) => {
  const { username } = req.params;

  User.findOne({ username }, { id: 1 })
    .then((userID) => {
      Like.find({ userWhoLikes: userID.id })
        .populate('like')
        .populate(
          {
            path: "like", // Donde entra el populate
            populate: {
              path: "creator", // Porque el like es un post y quiero el creator
              model: "User", // Y el creator es un modelo de User
            }
          }
        )
        .then((posts) => {
          res.render("users/likes-list", { posts, username });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};


module.exports.comments = (req, res, next) => {
  const  id  = req.params;

  Post.findOne(id)
  .populate('creator')
  .then((post) => {
    Comment.find({ post: post.id })
    .then((comments) => {
      comments.reverse();
      res.render("posts/comments", { post, comments });
    })
  })
  .catch((err) => next(err));
};

module.exports.doComment = (req, res, next) => {
  const { id } = req.params;
  const commentToCreate = req.body;
  const currentUser = req.user;
  
  commentToCreate.post = id;
    
  Comment.create(commentToCreate)
  .then((commentCreated) => {
    return Comment.find({ post: id });
  })
  .then((comments) => {
    comments.reverse();
    res.render("posts/comments", { comments });
  })
  .catch((err) => next(err));
};