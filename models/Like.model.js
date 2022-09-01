const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({    
    userWhoLikes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    like: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
})

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;