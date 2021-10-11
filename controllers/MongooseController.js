const DBController = require('./DBController.js');
const mongoose = require("mongoose");

class MongooseController extends DBController {
  /**
   * Initialize mongodb connection
   * @param {String} uri Connection URI
   * @param {Function} next callback function
   */
  constructor(uri, next) {
      super();
    mongoose
      .connect(uri)
      .then(function (res) {
        console.log("Connected to MongoDB...");
        next();
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  /**
   * Save multiple data entries into mongodb
   * @param {Collection} collection Collection to insert into
   * @param {Array} data The data
   * @param {Function} next callback function
   */
  saveMany(collection,data,next){
    next = next?next:null;
    collection.insertMany(data, { ordered: false }, next);
  }

  /**
   * Save data into mongodb
   * @param {*} data Data to save
   * @param {Function} next callback function
   */
  save(data, next) {
      next = next?next:null;
    data
      .save()
      .then(function (res) {
        console.log(res);
      })
      .catch(function (err) {
        next(err);
        next = null;
      })
      .finally(function(){
        if(next!=null){
          next();
        }
      });
  }
}
module.exports = MongooseController;
