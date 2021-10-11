const MongooseController = require("./MongooseController.js");
const Const = require("../Utils/Const.js");
const QueueItem = require("../models/QueueItem.js");

class QueueController extends MongooseController {
  constructor(uri, next) {
    super(uri, next);
    this._id = 0;
  }

  /**
   * Consume 1 document from the db and return it (FIFO)
   * @param {Function} next callback function
   */
  consume(next) {
    QueueItem.findOneAndRemove({ sort: { _id: 1 } }, function (err, res) {
      if (err) {
        console.log(err);
      } else {
        next(res);
      }
    });
  }

  /**
   * Check if the queue collection is empty
   * @param {Function} next callback function
   */
  isEmpty(next) {
    return QueueItem.count(function (err, count) {
      if (err) {
        console.dir(err);
      } else {
        next(count === 0);
      }
    });
  }

  /**
   * Insert multiple item documents into the queue (@mongodb)
   * @param {Array} items An array containing the urls to crawl
   * @param {Function} next callback function 
   */
  addMany(items, next) {
    const _this = this;
    var queueItems = [];
    items.forEach(function (item, i) {
      // Prepare an array for Schema based bulk insert
      console.log(item);
      queueItems.push(
        new QueueItem({
          order_id: _this._id++,
          url: item.url,
          depthLeft: item.depthLeft,
        })
      );
    });
    // Insert the items into the queue
    super.saveMany(QueueItem.collection, queueItems, function (err) {
      // On DB Insert error
      if (err) {
        if (err.code === Const.DUPLICATE_ERROR) {
          console.log("Some items already in queue, ignoring..");
        } else {
          console.log(err);
        }
      } else {
        //console.log(items + " added to queue.");
      }
      // callback
      if(next!=null){
        next();
      }
    });
  }

  /**
   * Insert an item document into the queue (@mongodb)
   * @param {String} url The url to crawl
   * @param {Number} depth How deep to crawl
   */
  add(url, depth) {
    depth = depth ? depth : 0;
    const _this = this;
    /*QueueItem.findOneAndUpdate(
      { url: url },
      new QueueItem({
        order_id: _this._id++,
        url: url,
        depthLeft: depth,
      }),
      function (err, res) {
        console.log(url + " added to queue.");
      },
      { upsert: true }
    );*/

    // First check if this URL is new
    QueueItem.findOne({ url: url }, function (err, res) {
      if (err) {
        console.log(err);
      } else {
        if (!res) {
          // If the URL is new
          depth = depth ? depth : 0;
          // Insert the item into the queue
          _this.save(
            new QueueItem({
              order_id: _this._id++,
              url: url,
              depthLeft: depth,
            }),
            function (err) {
              // On DB Insert error
              if (err) {
                if (err.code === Const.DUPLICATE_ERROR) {
                  console.log(url + " already in queue, ignoring.");
                } else {
                  console.log(err);
                }
              } else {
                console.log(url + " added to queue.");
              }
            }
          );
        } else {
          // If the URL already exists
          console.log(url + " already in queue, ignoring.");
        }
      }
    });
  }
}
module.exports = QueueController;
