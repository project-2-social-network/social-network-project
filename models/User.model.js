const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const EMAIL_PATTERN = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const PASSWORD_PATTERN = /^.{8,}$/i
const USERNAME_PATTERN = /^\S*$/
const SALT_ROUNDS = 10

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      match: [
        USERNAME_PATTERN,
        "Username cannot contain spaces.",
      ],
      required: [true, "Username is required."],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      minLength: [2, "Name must contain at least 2 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      match: [EMAIL_PATTERN, "Email must be valid."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      match: [PASSWORD_PATTERN, "Password must contain at least 8 characters."],
    },
    googleID: {
      type: String,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/plasoironhack/image/upload/v1644663323/ironhack/multer-example/icono-de-li%CC%81nea-perfil-usuario-si%CC%81mbolo-empleado-avatar-web-y-disen%CC%83o-ilustracio%CC%81n-signo-aislado-en-fondo-blanco-192379539_jvh06m.jpg",
    },
    status: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      default: () => {
        return (
          Math.random().toString(36).substring(7) +
          Math.random().toString(36).substring(7) +
          Math.random().toString(36).substring(7) +
          Math.random().toString(36).substring(7)
        );
      },
    },
    bankAccount: {
      type: String,
    },
    birthdate: {
      type: Date,
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
);

userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "creator",
    justOne: true,
});

userSchema.virtual("follows", {
    ref: "Follow",
    localField: "_id",
    foreignField: "follower",
    justOne: true,
});

userSchema.virtual("follows", {
    ref: "Follow",
    localField: "_id",
    foreignField: "following",
    justOne: true,
});

userSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "userWhoLikes",
  justOne: true,
});

userSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "creator",
  justOne: true,
});

userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "sender",
  justOne: true,
});

userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "receiver",
  justOne: true,
});


userSchema.virtual("notifications", {
  ref: "Notification",
  localField: "_id",
  foreignField: "sender",
  justOne: true,
});

userSchema.virtual("notifications", {
  ref: "Notification",
  localField: "_id",
  foreignField: "receiver",
  justOne: true,
});

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
        bcrypt
            .hash(user.password, SALT_ROUNDS)
            .then(hash => {
                user.password = hash;
                next()
            })
            .catch(err => next(err))
    } else {
        next()
    }
})

userSchema.methods.checkPassword = function(password) {
    const user = this;

    return bcrypt.compare(password, user.password)
}

const User = mongoose.model('User', userSchema);

module.exports = User;