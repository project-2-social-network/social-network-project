const Message = require("../models/Message.model");
const Notification = require('../models/Notification.model');
const User = require("../models/User.model");

module.exports.selectUser = (req, res, next) => {
  const currentUser = req.user;
  const usersArr = [];
  
  Message.find({ sender: currentUser.id })
  .populate('receiver', {
    username: 1,
    image: 1
  })
  .then((messages) => {
    
    if(messages) {
      messages.forEach((message) => {
        usersArr.push(message.receiver);
      })
    }
    return Message.find({ receiver: currentUser.id })
           .populate('sender', {
            username: 1,
            image: 1
          })
  })
  .then((messages) => {
    if(messages) {
      messages.forEach((message) => {
        usersArr.push(message.sender);
    })
  }
    
    const listWithoutDuplicates = [...new Set(usersArr)]
    res.render('messages/list-users-message', { listWithoutDuplicates })
  })
  .catch((err) => next(err));
};

module.exports.messages = (req, res, next) => {
  const { username } = req.params;
  const currentUser = req.user;

  User.findOne({username})
  .then((userFound)=> {
    return Message.find({$or: [{$and: [{sender: currentUser.id}, {receiver: userFound.id}]}, {$and: [{receiver: currentUser.id}, {sender: userFound.id}]}]})
  })
  .then((msgs) => {
    res.render('messages/messages', { username, msgs })
  })
  .catch((err) => next(err));
};

module.exports.createMessage = (req, res, next) => {
  const currentUser = req.user;
  const { username } = req.params;
  const { msg } = req.body;
  
  let msgToSave = {};

  msgToSave.sender = currentUser.id;
  msgToSave.msg = msg;
   
  User.findOne({ username })
  .then((userFound)=> {
    const userID = userFound.id
    msgToSave.receiver = userFound.id;
    Message.create(msgToSave)
    .then((msgSaved) => {
      res.status(204).send(msgSaved);
      return Notification.create({
        type: "Message",
        sender: currentUser.id,
        receiver: userID,
      })
    })
    .catch((err) => next(err));
  })  
  .catch((err) => next(err));
};

module.exports.notifications = (req, res, next) => {
  const currentUser = req.user;

  Notification.find({ receiver: currentUser.id })
  .populate('sender')
    .then((notifications) => {
      notifications.reverse();
      notifications.forEach((not) => {
        if (not.type === "Like") {
          not.newLike = "gave you a like.";
        } else if (not.type === "Follow") {
          not.newFollow = "started following you.";
        } else if (not.type === "Comment") {
          not.newComment = "commented on your post.";
        } else {
          not.newMessage = "messaged you.";
        }
      })      
      res.render("notifications", { notifications });
    })
    .catch((err) => next(err));
  
};