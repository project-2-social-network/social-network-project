const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        maxlength: 240,
    },
    media: {
        type: String,
    },
    gif: {
        type: String,
    }
}, { 
    timestamps: true
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
