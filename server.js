const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Const = require("./utils/Const.js");

const QueueController = require("./controllers/QueueController.js");
const queue = new QueueController(
  "mongodb://localhost:"+Const.MONGODB_PORT+"/wikiQueue",
  connectSocket
);

/**
 * Entry
 */
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

/**
 * Start server and listen on socket
 */
function connectSocket() {
  server.listen(Const.PORT, function () {
    console.log("Server is running on port: " + Const.PORT);
  });

}

function onConnection(socket) {
  // An entry request from a remote node
  function entry(data) {
    const alg = data[0].alg;
    delete data[0].alg;
    if (alg === "BFS") {
      produce(data);
    } else {
      //doDFS(data);
    }
  }
  // A produce request from a remote node
  function produce(data) {
    console.log("produce links", data);
    queue.addMany(data, function () {
      io.emit("wake");
    });
  }
  // A consume request from a remote node
  function consume(data, callback) {
    // Check if queue is empty
    queue.isEmpty(function (empty) {
      if (!empty) {
        // If there's more work
        // Consume first queue item
        queue.consume(function (item) {
          console.log("consume", item);
          // Send queue item back to remote node
          callback(item);
        });
      } else {
        // If there's no more work
        console.log("out of queue");
        // Send sleep notification to remote node
        io.emit("sleep");
      }
    });
  }
  // Listen for produce/consume events
  socket.on("entry", entry);
  socket.on("produce", produce);
  socket.on("consume", consume);
}

// Listen to socket connection initialization
io.on("connection", onConnection);
