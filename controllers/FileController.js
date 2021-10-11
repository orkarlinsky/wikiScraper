const DBController = require("./DBController.js");
const fs = require("fs");

class FileController extends DBController {
  constructor(dir,next) {
    super();
    this.dir = dir;
    next();
  }

  /**
   * Save a document to the filesystem as JSON
   * @param {String} fileName File name
   * @param {*} data Document data
   * @param {Function} next callback function
   */
  save(fileName, data, next) {
    fs.writeFile(this.dir+'/'+fileName, JSON.stringify(data , null, 2), function (err) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
      next();
    });
  }
}
module.exports = FileController;
