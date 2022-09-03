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
    likesCount: {
        type: Number,
        required: true,
        default: 0
    },
    commentsCount: {
        type: Number,
        required: true,
        default: 0
    }
},
{
    timestamps: true,
    toObject: { virtuals: true },

});

postSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "like",
  justOne: true,
});

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "comment",
  justOne: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;