const User = require("../models/User.model");
const Post = require("../models/Post.model");
const mongoose = require("mongoose");
const Follow = require("../models/Follow.model");

module.exports.profile = (req, res, next) => {
    const { username } = req.params;
    
    User.findOne({ username })
    .then((user) => {
        user.joinedDate = user.date.getFullYear()
        const userId = user.id.valueOf()
        Post.find({ creator: userId })
        .then((posts) => {
            res.render('users/profile', { user, posts })
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
};

module.exports.search = (req, res, next) => {
    const { searchInfo } = req.body;

    User.find({$or: [{ username: {$regex : searchInfo, $options : 'i'}}, { name: {$regex : searchInfo, $options : 'i'}}]})
    .then((users) => {
        res.render('users/list', { users });
    })
    .catch((err) => next(err))
};

module.exports.doFollow = (req, res, next) => {
    const { username } = req.params;
    let followInfo;
    followInfo.userWhoFollows = currentUser.id;

    User.find({ username }, { _id: 1 })
    .then((userID) => {
        followInfo.following = userID;
        return Follow.findOne(currentUser.id)
    })
    .then((userFound) => {
        if(userFound) {
            return userFound.following.push(followInfo.following)
        } else {
            Follow.create({followInfo})
            .then((userCreated) => {
                console.log(userCreated)
            })
            .catch((err) => next(err))
        };

        return Follow.findOne(followInfo.following)
    })
    .then((userFound) => {
        if(userFound) {
            return [...userFound.followers, followInfo.userWhoFollows]
        } else {
            Follow.create({userWhoFollows: followInfo.following, followers: [...followers, followInfo.userWhoFollows] })
            .then((userCreated) => {
                console.log(userCreated)
            })
            .catch((err) => next(err))
        };
    })
    .catch((err) => next(err))
};