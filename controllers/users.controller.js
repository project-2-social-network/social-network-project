const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Follow = require("../models/Follow.model");
const Like = require("../models/Like.model");
const Notification = require("../models/Notification.model");

module.exports.profile = (req, res, next) => {
    const { username } = req.params;
    const currentUser = req.user;
    
    User.findOne({ username })
    .then((user) => {
        user.joinedDate = user.createdAt.getFullYear()
        const userId = user.id.valueOf()
        const active = user.status ? true : false;

        Follow.findOne({ $and: [{follower: currentUser.id}, {following: userId}]})
        .then((response) => {
            const itsMeMario = currentUser.id === userId ? true : false;
            const imFollower = response ? true : false;
            Post.find({ creator: userId })
            .populate('creator')
            .then((posts) => {
                posts.forEach((post) => {
                    const postCreator = post.creator.id.valueOf();
                    return post.sameOwner = currentUser.id === postCreator ? true : false;
                })
                posts.reverse()
                Follow.find({following: userId})
                .then((followers) => {
                    const followersCount = followers.reduce((acc, curr) => {
                        return acc += 1
                    }, 0)
                    Follow.find({follower: userId})
                    .then((following) => {
                        const followingCount = following.reduce((acc, curr) => {
                            return acc += 1
                        }, 0)
                    res.render("users/profile", {
                      user,
                      posts,
                      imFollower,
                      itsMeMario,
                      followersCount,
                      followingCount,
                      active,
                    });
                    })
                    .catch((err) => next(err))
                })
                .catch((err) => next(err))
            })
            .catch((err) => next(err))
        })
        .catch((err) => next(err))        
    })
    .catch((err) => next(err))
};

module.exports.search = (req, res, next) => {
    const { searchInfo } = req.body;
    User.find({
      $and: [
        { status: true },
        {
          $or: [
            { username: { $regex: searchInfo, $options: "i" } },
            { name: { $regex: searchInfo, $options: "i" } }
          ]
        }
      ]
    })
    .then((users) => {
        res.render('users/list', { users });
    })
    .catch((err) => next(err))
};

module.exports.doFollow = (req, res, next) => {
    const { username } = req.params;
    const currentUser = req.user;

    User.findOne({username}, {id: 1})
    .then((userID) => {  
        Follow.findOne({follower: currentUser.id, following: userID.id})
        .then((response) => {
            if(response) {
                Follow.findOneAndDelete({follower: currentUser.id, following: userID.id})
                .then((followDeleted) => {
                    res.status(204).send(followDeleted);
                })
                .catch((err) => next(err))
            } else {
                Follow.create({follower: currentUser.id, following: userID.id})
                .then((followCreated) => {
                    res.status(204).send(followCreated);
                    Notification.create({
                      type: "Follow",
                      sender: currentUser.id,
                      receiver: userID.id,
                    });
                })
                .catch((err) => next(err))
            }
        })              
    })    
    .catch((err) => next(err))
};

module.exports.followersList = (req, res, next) => {
    const { username } = req.params;

    User.findOne({username}, {id: 1})
    .then((userID) => {  
        Follow.find({following: userID.id})
        .populate('follower')
        .then((followers) => {
            res.render('users/followers-list', { followers })
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
};

module.exports.followingList = (req, res, next) => {
    const { username } = req.params;

    User.findOne({username}, {id: 1})
    .then((userID) => {  
        Follow.find({follower: userID.id})
        .populate('following')
        .then((following) => {
            res.render('users/following-list', { following })
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
};

module.exports.likesList = (req, res, next) => {
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