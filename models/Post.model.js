const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        minLength: 1,
        maxlength: 240      
    },
    media: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
},
{
    toObject: { virtuals: true },
});

postSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "like",
  justOne: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;