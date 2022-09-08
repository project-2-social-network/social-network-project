const Message = require("../models/Message.model");
const User = require("../models/User.model");

module.exports.selectUser = (req, res, next) => {
    res.send('pagina con usuarios para enviar msgs')
};

module.exports.messages = (req, res, next) => {
  const { username } = req.params;
  const currentUser = req.user;

  User.findOne({username})
  .then((userFound)=> {
    return Message.find({$and: [{sender: currentUser.id}, {receiver: userFound.id}]})
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
  console.log('entra:', msg)
  let msgToSave = {};

  msgToSave.sender = currentUser.id;
  msgToSave.msg = msg;
  console.log('entra2:', msgToSave)  
  User.findOne({ username })
  .then((userFound)=> {
    console.log('entra3:', userFound) 
    msgToSave.receiver = userFound.id;
    console.log(msgToSave)
    return Message.create(msgToSave)
  })
  .then((msgSaved) => {
    res.status(204).send(msgSaved);
  })
  .catch((err) => next(err));
};
