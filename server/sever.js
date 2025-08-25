import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import { Server } from "socket.io";

// Create Express app and HTTP serever
const app = express();
const server = http.createServer(app)

//Initialize socet.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

//Store online Users
export const userSoketMap = {}; //{ userId: socketId }

//Socket.io connectio handler......
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

   //Emit online user to all connected clients
   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   socket.on("disconnect", ()=> {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSoketMap))
   })
})

//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());

//routes setup
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

///connect to mongoDB
await connectDB();
if(process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, ()=> console.log ("Server is running on PORT: " + PORT));
}

// Export server for Vercel
export default server;
