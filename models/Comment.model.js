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
        minLength: 1,
        maxlength: 240,
    },
    media: {
        type: String,
    },

}, { 
    timestamps: true
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
