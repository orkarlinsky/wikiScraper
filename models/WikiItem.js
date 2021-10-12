const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wikiItemSchema = new Schema(
  {
    order_id: Number,
    url: String,
    title: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    short: {
      type: String,
      required: false,
    },
    stub: {
      type: String,
      required: true,
    },
    internal_links: [
      {
        url: String,
        depthLeft: Number,
      },
    ],
    external_links: [String],
  },
  { timestamps: true }
);
const WikiItem = mongoose.model("WikiItem", wikiItemSchema);
module.exports = WikiItem;
