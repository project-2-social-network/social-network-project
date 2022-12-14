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
    response.articles.forEach((art) => {
      art.smallTitle = art.title.substring(0, 50) + '...'
    })
    res.locals.news = response.articles;
    next();
  })
  .catch((err) => {
    next()
  })
});

app.use((req, res, next) => { 
  User.find({status: true}, { id: 1, username: 1, name: 1, image: 1})
    .then((users) => {
      return Follow.find({ follower: res.locals.currentUser.id }, { following: 1 })
            .then((follows) => {
              for(i = 0; i < follows.length; i++) {
                let followingId = follows[i].following.valueOf();
                for(j = 0; j < users.length; j++) {
                  if(followingId === users[j].id) {
                    users.splice(j, 1);
                  }
                }
              };
              users.splice(2);
              users.forEach((user, index) => {
                if(user.id === res.locals.currentUser.id) {
                  users.splice(index, 1)
                };
                user.name = user.name.substring(0, 18);
                user.username = user.username.substring(0, 23);
              })
              res.locals.usersToFollow = users;
              next()
            })
            .catch((err) => {next()})  
          next()
        })      
        .catch((err) => {next()})    
});

const onlineUsers = [];

const addNewUser = (username, socketID, image) => {
  !onlineUsers.some((user) => user.username === username) && onlineUsers.push({ username, socketID, image })
};

const removeUser = (socketID) => {
  return onlineUsers.forEach((user, index) => {
    if (user.socketID === socketID) {
      return onlineUsers.splice(index, 1)
    }
  })
};

io.on("connection", socket => {
  console.log("entra en connected----------------");
  socket.on('newUser', (sender) => {
    addNewUser(sender.username, socket.id, sender.image);
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
  })

  socket.on('chatmessage', (msg, username) => {
    const userToMessage = onlineUsers.find(user => {
      return user.username === username
    });

    const userSending = onlineUsers.find((user) => {
      return user.socketID === socket.id;
    });
    console.log('entra en chat message----------------',userSending)
   
    if (userToMessage) {
      io.to(userToMessage.socketID).emit("message", msg, userSending.image);
    }   

    io.to(socket.id).emit("message", msg, userSending.image);
  })

  socket.on("notification", (username) => {
    const userToNot = onlineUsers.find(user => {
      return user.username === username
    });
    
    if (userToNot) {
      io.to(userToNot.socketID).emit("not");
   }
  });
});

const router = require("./config/index.routes");
const { Server } = require("net");
app.use(router);

app.use((err, req, res, next) => {
  res.render("error", { err });
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));