require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const hbs = require("hbs");
const sessionConfig = require("./config/session.config");
const passport = require("passport");

require("./config/passport.config");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

app.use(express.json());

app.use(sessionConfig);

app.use(express.static(__dirname + "/public"));

const server = require("http").createServer(app);
const options = { cors: { origin: '*' } };
const io = require("socket.io")(server, options);

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

app.use(passport.initialize());
app.use(passport.session());

hbs.registerPartials(__dirname + "/views/partials");

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.API_KEY_NEWS);
const User = require("./models/User.model");
const Follow = require("./models/Follow.model");

app.use((req, res, next) => {
  newsapi.v2.topHeadlines({
    language: 'en',
  })
  .then(response => {
    response.articles.splice(3);
    res.locals.news = response.articles;
    next();
  })
  .catch((err) => {
    next()
  })
});

app.use((req, res, next) => { 
  User.find()
  .then((users) => {
    return Follow.find({follower: {$ne: res.locals.currentUser.id }}, {following: 1}).populate('following')
  })
  .then((follows) => {
    follows.splice(3);  
    const usersToFollow = follows;
    res.locals.usersToFollow = usersToFollow;
    next()
  })
  .catch((err) => {
    next()
  })
});

const onlineUsers = [];

const addNewUser = (username, socketID) => {
  !onlineUsers.some((user) => user.username === username) && onlineUsers.push({ socketID, username })
};

const removeUser = (socketID) => {
  return onlineUsers.forEach((user, index) => {
    if (user.socketID === socketID) {
      return onlineUsers.splice(index, 1)
    }
  })
};

io.on("connection", socket => {

  socket.on('newUser', username => {
    addNewUser(username, socket.id)
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
  })

  socket.on('chatmessage', (msg, username) => {
    const userToMessage = onlineUsers.find(user => {
      return user.username === username
    });
 
    if (userToMessage) {
       io.to(userToMessage.socketID).emit("message", msg);
    }   

    io.to(socket.id).emit("message", msg);
  })

  socket.on("notification", (username) => {
    //console.log(username)
    //io.to(username).emit("not");
  });
});

const router = require("./config/index.routes");
app.use(router);

app.use((err, req, res, next) => {
  res.render("error", { err });
});

server.listen(3000, () => console.log("Listening on port 3000"));