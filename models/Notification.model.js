const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Follow", "Like", "Comment", "Message"]
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
