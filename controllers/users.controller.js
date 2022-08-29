const User = require("../models/User.model");
const Post = require("../models/Post.model");
const mongoose = require("mongoose");
const mailer = require("../config/mailer.config");
const bcrypt = require('bcrypt');

module.exports.settings = (req, res, next) => {
    const user = req.user
    res.render("users/settings", { user });
};

module.exports.changePassword = (req, res, next) => {
    const user = req.user
    res.render("users/form-password", { user });
};

module.exports.doChangePassword = (req, res, next) => {
    const { username } = req.params;
    const SALT_ROUNDS = 10;
    const { password } = req.body

    bcrypt
    .hash(password, SALT_ROUNDS)
    .then(hash => {
        return User.findOneAndUpdate(username, { password: hash }, { new: true })
    })
    .then((response) => {
        res.render('users/settings', { message: 'Password successfully updated.' })
    })
    .catch((err) => {
        if (err instanceof mongoose.Error.ValidationError) {
            res.render("users/form-password", { error: err.errors });
        }
        next(err);
    })
};

module.exports.deleteAccount = (req, res, next) => {
    const { username } = req.params;

    User.findOneAndDelete(username)
    .then((userDeleted) => {
        res.redirect('/')
    })
    .catch((err) => next(err))
};

module.exports.profile = (req, res, next) => {
    const { username } = req.params;
    
    User.findOne({ username })
    .then((user) => {
        user.joinedDate = user.date.getFullYear()
        const userId = user.id.valueOf()
        Post.find({ creator: userId })
        .then((posts) => {
            console.log(user)
            res.render('users/profile', { user, posts })
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
};