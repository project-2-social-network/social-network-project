const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const mongoose = require("mongoose");


module.exports.settings = (req, res, next) => {
    const user = req.user
    res.render("account/settings", { user });
};

module.exports.changePassword = (req, res, next) => {
    const user = req.user
    res.render("account/form-password", { user });
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
                    res.render('account/settings', { user , message: 'Password successfully updated.' })
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