const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

app.set("view engine", "ejs"); // To tell Express EJS is used
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

// here used get to render home page;home.ejs
app.get("/", (req, res) => {

  res.render("home");
});


// if room id is not entered generates a unique id otherwise takes you to the room with entered roomID
app.get("/room", (req, res) => {

  if (req.query.rooms) {
    if(req.query.rooms.includes('/')){
      res.redirect(`/${req.query.rooms.split("/")[3]}`);
    }
    res.redirect(`/${req.query.rooms}`);

  }
  else {
    res.redirect(`/${uuidv4()}`);
  }


});

// Renders room with a room id
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//When someone connects to the server
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);

    });
    // To communicate the disconnection
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      
    })
  });
});

server.listen(process.env.PORT || 2722);
