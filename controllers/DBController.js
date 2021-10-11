// This is an abstract class to serve as an interface for DB handling
class DBController {
  constructor() {
    if (new.target === DBController) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }

  save() {}
}
module.exports = DBController;
