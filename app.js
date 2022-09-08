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

io.on("connection", socket => { 
  console.log('User connected')
  socket.emit('message', '')
  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
  socket.on('chatmessage', msg => {
    io.emit('message', msg)
  })
});

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

app.use(passport.initialize());
app.use(passport.session());

hbs.registerPartials(__dirname + "/views/partials");

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const router = require("./config/index.routes");
app.use(router);

app.use((err, req, res, next) => {
  res.render("error", { err });
});

server.listen(3000, () => console.log("Listening on port 3000"));