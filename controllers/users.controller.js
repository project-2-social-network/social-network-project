const User = require("../models/User.model");
const Post = require("../models/Post.model");
const mongoose = require("mongoose");

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
        console.log(users);
        res.render('users/list', { users });
    })
    .catch((err) => next(err))
}