const Message = require("../models/Message.model");
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
    msgToSave.receiver = userFound.id;
    return Message.create(msgToSave)
  })
  .then((msgSaved) => {
    res.status(204).send(msgSaved);
  })
  .catch((err) => next(err));
};
