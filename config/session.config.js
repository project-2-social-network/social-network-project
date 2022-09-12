const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const { DB } = require('./db.config');

const sessionMaxAge = process.env.SESSION_AGE || 7;
const sessionConfig = expressSession({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE === "true" || false,
      maxAge: 24 * 60 * 60 * 1000 * sessionMaxAge, 
      httpOnly: true,
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },
    store: new MongoStore({
      mongoUrl: DB,
      ttl: 24 * 60 * 60 * sessionMaxAge,
    }),
  });
  
  module.exports = sessionConfig;