const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const mongoose = require("mongoose");


module.exports.settings = (req, res, next) => {
    const currentUser = req.user
    res.render("account/settings", { currentUser });
};

module.exports.changePassword = (req, res, next) => {
    const currentUser = req.user
    res.render("account/form-password", { currentUser });
};

module.exports.doChangePassword = (req, res, next) => {
    const currentUser = req.user;
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
                    res.render('account/settings', { currentUser , message: 'Password successfully updated.' })
                })
                .catch((err) => {
                    if (err instanceof mongoose.Error.ValidationError) {
                        res.render("account/form-password", { error: err.errors });
                    } else {
                        next(err);
                    }
                })
            } else {
                res.render("account/form-password", { errorMatch: 'Incorrect password.' });
                return
            }   
        })
    })
    .catch((err) => {
        if (err instanceof mongoose.Error.ValidationError) {
            res.render("account/form-password", { error: err.errors });
        } else {
            next(err);
        }
    })
};

module.exports.changeUsername = (req, res, next) => {
    const currentUser = req.user;
    res.render("account/form-username", { currentUser });
};

module.exports.doChangeUsername = (req, res, next) => {
    const { id } = req.user;
    const { username } = req.body;

    if (username.includes(' ')) {
        res.render("account/form-username", { error: "Username cannot contain spaces." })
    } else {
        User.findByIdAndUpdate( id , { username }, { new: true })
        .then((userUpdated) => {
            res.render('account/settings', { usernameMessage: 'Username successfully updated.' })
        })
        .catch((err) => {
            res.render("account/form-username", { error: "Username already taken. Choose another one." });
        })
    }
};

module.exports.deleteAccount = (req, res, next) => {
    const { id } = req.params;

    User.findOneAndDelete(id)
    .then((userDeleted) => {
        return Post.deleteMany({ creator: id });
    })
    .then((postDeleted) => {
        req.logout(() => res.redirect("/"));
    })
    .catch((err) => next(err))
};