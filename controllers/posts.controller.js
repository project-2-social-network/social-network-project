const Post = require("../models/Post.model");
const Follow = require("../models/Follow.model");
const Like = require("../models/Like.model");
const Comment = require("../models/Comment.model");
const Notification = require("../models/Notification.model");
const moment = require('moment');

//API
const GIPHY = require("giphy-api")(process.env.GIPHY_KEY);

module.exports.home = (req, res, next) => {
  const currentUser = req.user;

  Follow.find({ follower: currentUser.id }, { following: 1 })
    .then((usersIfollow) => {
      const everyUserPostListPromise = [];

      usersIfollow.forEach((follow) => {
        const userID = follow.following.valueOf();
        everyUserPostListPromise.push(
          Post.find({ creator: userID }).populate("creator", {
            username: 1,
            image: 1,
          })
        );
      });
      everyUserPostListPromise.push(
        Post.find({ creator: currentUser.id }).populate("creator", {
          username: 1,
          image: 1,
        })
      );
      return Promise.all(everyUserPostListPromise).then((everyUserPostList) => {
        const finalList = everyUserPostList.reduce((acc, curr) => {
          return [...acc, ...curr];
        }, []);
        finalList.forEach((post) => {
          post.hour = moment(post.createdAt).format('DD/MM/YY - hh:mm')
          if (post.creator) {
            const postCreator = post.creator.id.valueOf();
            post.sameOwner = currentUser.id === postCreator ? true : false;
          }
        });
        const listWithoutDuplicates = [...new Set(finalList)]
        const likesPromises = listWithoutDuplicates.map((post) => {
          return Like.findOne({
            $and: [{ like: post._id }, { userWhoLikes: currentUser.id }],
          })
            .then((likeFound) => {
              post.alreadyLiked = likeFound ? true : false
            })
            .catch((err) => next(err));
        });

        Promise.all(likesPromises)
        .then((results) => {
          listWithoutDuplicates.sort((a, b) => {
            return b.createdAt - a.createdAt
          })
          res.render("posts/home", { listWithoutDuplicates });
        })
        .catch(next)
        
      });
    })
    .catch((err) => next(err));
};

module.exports.explore = (req, res, next) => {
  const currentUser = req.user;
  
  Post.find()
    .limit(50)
    .populate("creator")
    .then((posts) => {
      posts.forEach((post) => {
        post.hour = moment(post.createdAt).format('DD/MM/YY - hh:mm')
        Like.findOne({
          $and: [{ like: post._id }, { userWhoLikes: currentUser.id }],
        })
          .then((likeFound) => {
            return (post.alreadyLiked = likeFound ? true : false);
          })
          .catch((err) => next(err));      
      })
    posts.sort((a, b) => {
      return b.createdAt - a.createdAt
    })
    res.render("posts/explore", { posts });
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
      res.redirect('/home');
    })
    .catch((err) => {
      if (err.message === "No Content provided") {
        res.redirect('/home');
        
      } else {
        next(err);
      }
    });
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

  Like.findOne({ userWhoLikes: currentUser.id, like: id })
    .then((likeFound) => {
      if (likeFound) {
        Like.findOneAndDelete({ userWhoLikes: currentUser.id, like: id })
          .then((likeDeleted) => {
            res.status(204).send(likeDeleted);
            Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } })
              .then((postUpdated) => {})
              .catch((err) => next(err));
          })
          .catch((err) => next(err));
      } else {
        Like.create({ userWhoLikes: currentUser.id, like: id })
          .then((likeCreated) => {
            res.status(204).send(likeCreated);
            Post.findById(id)
            .populate('creator')
              .then((postFound) => {
                const userID = postFound.creator.id;
                postFound.likesCount += 1;
                postFound.save();
                Notification.create({
                  type: "Like",
                  sender: currentUser.id,
                  receiver: userID,
                });
              })
              .catch((err) => next(err));
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
};

module.exports.comments = (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user;
  Post.findById(id)
    .populate("creator")
    .then((post) => {
      Comment.find({ post: post.id })
        .populate("creator")
        .then((comments) => {
          comments.forEach((comment) => {
           comment.sameOwner = comment.creator.id === currentUser.id;
           comment.hour = moment(comment.createdAt).format('DD/MM/YY - hh:mm')
         }); 
          res.render("posts/comments", { post, comments });
        });
    })
    .catch((err) => next(err));
};

module.exports.doComment = (req, res, next) => {
  const { id } = req.params;
  const commentToCreate = req.body;
  const currentUser = req.user;
  
  commentToCreate.post = id;

   if (req.file) {
     commentToCreate.media = req.file.path;
   }

  Comment.create(commentToCreate)
    .then((commentCreated) => {
      return Post.findById(id)
      .populate('creator');
    })
    .then((postFound) => {
      const userID = postFound.creator.id;
      postFound.commentsCount += 1;
      postFound.save();
      res.redirect(`/comments/${id}`);
      Notification.create({
        type: "Comment",
        sender: currentUser.id,
        receiver: userID,
      });    
    })
    .catch((err) => next(err));
};

module.exports.likesList = (req, res, next) => {
  const { id } = req.params;

  Like.find({ like: id })
    .populate("userWhoLikes")
    .then((people) => {
      res.render("posts/likes-list", { people });
    })
    .catch((err) => next(err));
};

module.exports.doDeleteComment = (req, res, next) => {
  const { id } = req.params;
  Comment.findByIdAndDelete(id)
    .then((comment) => {
      const postId = comment.post.valueOf();
      Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } })
        .then((postUpdated) => {
          res.status(204).send(comment);
        })
        .catch((err) => {
          next(createError(404, "Comment not found"));
        });
    })
    .catch((err) => {
      next(createError(404, "Comment not found"));
    });
};

module.exports.giphyList = (req, res, next) => {
  GIPHY.trending({ limit: 8 })
    .then((gifs) => {
      const giphys = gifs.data;
      res.send(giphys);
    })
    .catch((err) => {
      next(createError(404, "Gifs not found"));
    });
};

module.exports.giphySearchList = (req, res, next) => {
  const { search } = req.params;

  GIPHY.search({ q:search, limit: 8 })
    .then((gifs) => {
      const giphys = gifs.data;
      res.send(giphys);
    })
    .catch((err) => {
      next(createError(404, "Gifs not found"));
    });
};