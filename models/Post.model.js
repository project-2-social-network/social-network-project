const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
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
    likesCount: {
      type: Number,
      required: true,
      default: 0,
    },
    commentsCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

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

postSchema.pre("save", function (next) {
  const hasContent = this.content || this.media;
  console.log("hasContent ", hasContent);
  return hasContent ? next() : next(new Error("No Content provided"));
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
