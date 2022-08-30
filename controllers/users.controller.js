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
    const user = req.user;
    const { username } = req.params;    
    const  { oldPassword, newPassword } = req.body;

    User.findOne( { username } )
    .then((userFound) => {
        userFound.checkPassword(oldPassword)
        .then((match) => {
            if (match) {
                userFound.password = newPassword;
                userFound.save()
                .then((userSave) => {
                    res.render('users/settings', { user , message: 'Password successfully updated.' })
                })
                .catch((err) => {
                    if (err instanceof mongoose.Error.ValidationError) {
                        res.render("users/form-password", { error: err.errors });
                    } else {
                        next(err);
                    }
                })
            } else {
                res.render("users/form-password", { errorMatch: 'Incorrect password.' });
                return
            }   
        })
    })
    .catch((err) => {
        if (err instanceof mongoose.Error.ValidationError) {
            res.render("users/form-password", { error: err.errors });
        } else {
            next(err);
        }
    })
};

module.exports.deleteAccount = (req, res, next) => {
    const { id } = req.params;

    User.findOneAndDelete(id)
    .then((userDeleted) => {
        req.logout(() => res.redirect("/"));
        return Post.deleteMany({ creator: id})
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
            res.render('users/profile', { user, posts })
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
};