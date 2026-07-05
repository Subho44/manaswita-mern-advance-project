const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
const Post = require("./models/Post");
const postroutes = require("./routes/postRoutes");
const Message = require("./models/Message");
const meetingRoutes = require("./routes/meetingRoutes");


require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());





mongoose.connect(process.env.MONGO_URL);
console.log("mongodb connected");

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
});

let onlineUsers = [];
io.on("connection", (socket)=>{
    console.log("user connected", socket.id);

    //like
    socket.on("likePost", async (postid) => {
        const post = await Post.findByIdAndUpdate(
            postid,
            { $inc: { likes: 1 } },
            { new: true }
        );
        io.emit("postUpdated", post);
    });

    //comment
    socket.on("commentPost", async (data) => {
        const post = await Post.findByIdAndUpdate(
            data.postid,
            {
                $push: {
                    comments: {
                    text:data.text
            } } },
            { new: true }
        );
        io.emit("postUpdated", post);
    });

    //share
     socket.on("sharePost", async (postid) => {
        const post = await Post.findByIdAndUpdate(
            postid,
            { $inc: { shares: 1 } },
            { new: true }
        );
        io.emit("postUpdated", post);
     });
    
    //adduser
    socket.on("addUser", (username) => {
        const userexit = onlineUsers.find((user) => user.username === username);
        if (!userexit) {
            onlineUsers.push({
                username,
                socketId: socket.id
            });
        }
        io.emit("onlineUsers", onlineUsers);
     });
    
    
    //send message
    socket.on("sendMessage", async(data) => {
        const { sender, receiver, text } = data;
        const newmessage = await Message.create({
            sender,
            receiver,
            text
        });
        const receiveruser = onlineUsers.find(
            (user) => user.username === receiver
        );
        if (receiveruser) {
            io.to(receiveruser.socketId).emit("receiveMessage", newmessage);
        }
        socket.emit("receiveMessage", newmessage);
    });
    

    socket.on("disconnect", () => {
  onlineUsers = onlineUsers.filter(
    (user) => user.socketId !== socket.id
  );

  io.emit("onlineUsers", onlineUsers);

  console.log("user disconnected:", socket.id);
});

});

app.use("/api/posts", postroutes);
app.use("/api/meetings", meetingRoutes);

app.get("/",(req,res)=>{
    res.send("api is working");
});

app.get("/api/messages/:sender/:receiver", async (req, res) => {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
        $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender }
        ]
    });
    res.json(messages);
})

server.listen(process.env.PORT, ()=>{
    console.log("server is running port 5500");
});
