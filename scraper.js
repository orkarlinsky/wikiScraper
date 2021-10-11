const io = require("socket.io-client");
const Const = require("./utils/Const.js");
const MongooseController = require("./controllers/MongooseController.js");
//const FileController = require("./controllers/FileController.js");
const WikiItemReader = require("./utils/WikiItemReader.js");

const dbController = new MongooseController(
  "mongodb://localhost:"+Const.MONGODB_PORT+"/wikiDB",
  connectSocket
);

var socket;

/**
 * Connect to socket
 */
function connectSocket() {
  socket = io("http://localhost:" + Const.PORT, { reconnect: true });
  // Add a connect listener
  socket.on("connect", function (socket) {
    console.log("Socket connected!");
    wake();
  });
}

/**
 * Wake node up
 */
function wake() {
  socket.off("wake", wake);
  // start listen to sleep event
  socket.on("sleep", sleep);
  console.log("work is waiting, waking up.");
  // Start working
  getWork();
}
/**
 * Make node sleep
 */
function sleep() {
  socket.off("sleep", sleep);
  // start listen to wake event
  socket.on("wake", wake);
  console.log("no work available,sleeping..");
  //socket.disconnect();
}

function getWork() {
  console.log("asking for work...");
  // Send remote server a consume request, returned data will be calledback to 'scrape'
  socket.emit("consume", null, scrape);
}

/**
 * Get a queued item and scrape it
 * @param {Object} srcItem The item to scrape
 */
async function scrape(srcItem) {
  console.log("working", srcItem);
  var orderID = srcItem.order_id;
  var url = srcItem.url;
  var depthLeft = srcItem.depthLeft;
  depthLeft--;

  // Scrape the document
  const { wikiItem, internalLinks } = await WikiItemReader.read(
    url,
    orderID,
    depthLeft
  );

  if (depthLeft >= 0) { // If there's more depth to crawl into
    // Send this document's internal links to the remote server for further scraping
    socket.emit("produce", internalLinks);
  }

  // Save the scraped data for this document
  dbController.save(wikiItem, getWork);
}
