const User = require("../models/User.model");
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
    const { id } = req.params;
    const SALT_ROUNDS = 10;
    const { password } = req.body

    bcrypt
    .hash(password, SALT_ROUNDS)
    .then(hash => {
        return User.findOneAndUpdate(id, { password: hash }, { new: true })
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
    const { id } = req.params;

    User.findOneAndDelete(id)
    .then((userDeleted) => {
        res.redirect('/')
    })
    .catch((err) => {
        next(err);
    })
};