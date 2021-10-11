const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QueueItemSchema = new Schema(
  {
    order_id: Number,
    url: { type: String, unique: true, index: { unique: true } },
    depthLeft: Number,
  },
  { timestamps: true }
);
const QueueItem = mongoose.model("QueueItem", QueueItemSchema);
module.exports = QueueItem;
