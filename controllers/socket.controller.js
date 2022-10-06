const Message = require("../models/Message.model");
const Notification = require('../models/Notification.model');
const User = require("../models/User.model");

module.exports.selectUser = (req, res, next) => {
  const currentUser = req.user;
  const usersArr = [];
  
  Message.find({$or: [{ sender: currentUser.id }, { receiver: currentUser.id }]})
  .populate('receiver', {
    username: 1,
    image: 1,
    id: 1
  })
  .populate('sender', {
    username: 1,
    image: 1,
    id: 1
  })
  .then((messages) => {
    if(messages) {
      messages.forEach((message) => {
        usersArr.push(message.receiver);
        usersArr.push(message.sender)
      })
    };

    let listWithoutDuplicates = usersArr.filter((value, index, array) =>
      index === array.findIndex((t) => (
        t.username === value.username
      ))
    )
    
    let listWithoutSelfUser = listWithoutDuplicates.filter((user) => 
      user.id !== currentUser.id
    )

    res.render('messages/list-users-message', { listWithoutSelfUser })
  })
  .catch((err) => next(err));
};

module.exports.messages = (req, res, next) => {
  const { username } = req.params;
  const currentUser = req.user;

  User.findOne({username})
  .then((userFound)=> {
    return Message.find({$or: [{$and: [{sender: currentUser.id}, {receiver: userFound.id}]}, {$and: [{receiver: currentUser.id}, {sender: userFound.id}]}]})
    .populate('sender')
    .populate('receiver')
  })
  .then((msgs) => {
    msgs.forEach((msg) => {
      let indexOf = msg.createdAt.toString().indexOf('G');
      msg.hour = msg.createdAt.toString().slice(4, indexOf);
    })
    msgs.sort((a, b) => b.createdAt - a.createdAt)
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