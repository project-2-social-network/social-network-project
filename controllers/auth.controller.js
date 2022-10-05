const User = require("../models/User.model");
const mongoose = require("mongoose");
const passport = require("passport");
const mailer = require("../config/mailer.config");

module.exports.login = (req, res, next) => {
  res.render("auth/login");
};

const login = (req, res, next, provider) => {

  passport.authenticate(provider || "local-auth", (err, user, validations) => {
    if (err) {
      next(err);
    } else if (!user) {
      console.log(validations)
      res.status(404).render("auth/login", { errors: 'Credentials not valid.' });
    } else {
      req.login(user, (loginError) => {
        if (loginError) {
          next(loginError);
        } else {
          res.redirect("/home");
        }
      });
    }
  })(req, res, next);
};

module.exports.doLogin = (req, res, next) => {
  login(req, res, next);
};

module.exports.doLoginGoogle = (req, res, next) => {
  login(req, res, next, "google-auth");
};

module.exports.register = (req, res, next) => {
  res.render("auth/register");
};

module.exports.doRegister = (req, res, next) => {
  const user = req.body;

  User.findOne({ $or: [{ email: user.email }, { username: user.username }] })
    .then((userFound) => {
      if (userFound) {
        if (userFound.username === user.username && userFound.email === user.email) {
          res.render("auth/register", { errorUsername: "Username already exists. Choose another one.", errorEmail: "Email already exists, login.", user});
        } else if (userFound.email === user.email) {
          res.render("auth/register", { errorEmail: "Email already exists, login.", user});
        } else if (userFound.username === user.username) {
          res.render("auth/register", { errorUsername: "Username already exists. Choose another one.", user});
        };
      } else {
        return User.create(user).then((userCreated) => {
          mailer.sendActivationMail(
            userCreated.email,
            userCreated.activationToken
          );
          res.render("auth/login", { registerMessage: 'Please check your email to finish registering.' });
        });
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.render("auth/register", { errors: err.errors, user });
      } else {
        next(err);
      }
    });
};

module.exports.logout = (req, res, next) => {
  req.logout(() => res.redirect("/"));
};

module.exports.activateAccount = (req, res, next) => {
  const token = req.params.token;

  User.findOneAndUpdate(
    { activationToken: token, status: false },
    { status: true }
  )
    .then((user) => {
      if (user) {
        res.render("auth/login", {
          user: { email: user.email },
          message:
            "You have activated your account. Thanks for joining our team!",
        });
      } else {
        res.redirect("/");
      }
    })
    .catch(next);
};
