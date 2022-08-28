const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: { // El seguidor 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    following: { // Las personas que sigue el seguidor
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'    
    }
})

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;