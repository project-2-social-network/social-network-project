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

commentSchema.pre("save", function (next) {
    const hasContent = this.content || this.media || this.gif;
    return hasContent ? next() : next(new Error("No Content provided"));
  });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
