const mongoose = require("mongoose");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Follow = require("../models/Follow.model");

module.exports.profile = (req, res, next) => {
    const { username } = req.params;
    const currentUser = req.user;
    
    User.findOne({ username })
    .then((user) => {
        user.joinedDate = user.date.getFullYear()
        const userId = user.id.valueOf()

        Follow.findOne({ $and: [{follower: currentUser.id}, {following: userId}]})
        .then((response) => {
            const itsMeMario = currentUser.id === userId ? true : false;
            const imFollower = response ? true : false;
            Post.find({ creator: userId })
            .populate('creator')
            .then((posts) => {
                posts.forEach((post) => {
                    const postCreator = post.creator.id.valueOf();
                    return post.sameOwner = currentUser.id === postCreator ? true : false;
                })
                posts.reverse()
                res.render('users/profile', { user, posts, imFollower, itsMeMario })
            })
            .catch((err) => next(err))
        })
        .catch((err) => next(err))        
    })
    .catch((err) => next(err))
};

module.exports.search = (req, res, next) => {
    const { searchInfo } = req.body;

    User.find({$or: [{ username: {$regex : searchInfo, $options : 'i'}}, { name: {$regex : searchInfo, $options : 'i'}}]})
    .then((users) => {
        res.render('users/list', { users });
    })
    .catch((err) => next(err))
};

module.exports.doFollow = (req, res, next) => {
    const { username } = req.params;
    const currentUser = req.user;

    User.findOne({username}, {id: 1})
    .then((userID) => {  
        console.log('userID:', currentUser.id)
        Follow.findOne({follower: currentUser.id, following: userID.id})
        .then((response) => {
            console.log('response:', response)
            if(response) {
                Follow.findOneAndDelete({follower: currentUser.id, following: userID.id})
                .then((followDeleted) => {
                    console.log(followDeleted)
                    res.status(204).send(followDeleted);
                })
                .catch((err) => next(err))
            } else {
                Follow.create({follower: currentUser.id, following: userID.id})
                .then((followCreated) => {
                    console.log(followCreated)
                    res.status(204).send(followCreated);
                })
                .catch((err) => next(err))
            }
        })      
        
    })    
    .catch((err) => next(err))
};