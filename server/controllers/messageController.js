import Message from "../models/message.js";
import User from "../models/Use.jsr";
import cloudinary from "../lib/cloudinary.js";
import { io, userSoketMap } from "../sever.js";


//get all users except the logged in user
export const getUsersForSidebar = async (req, res) =>{
try {
    const userId = req.user._id;
    const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");
    
    // Count number of message not seen
    const unseenMessages = {}
    const promises = filteredUsers.map(async (user)=> {
        const message = await Message.find({senderId: user._id, receiverId: userId, seen: false})
        if(unseenMessages.length > 0) {
            unseenMessages[user._id] = unseenMessages.length;
        }
    })
    await Promise.all(promises);
    res.json({sucess: true, user: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({sucess: false, message: error.message})
    }
}

//Get all messages for selected user...........
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true})

        res.json({sucess: true, messages})

    } catch (error) {
        console.log(error.message);
        res.json({sucess: false, message: error.message}) 
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({sucess: true})
    } catch (error) {
        console.log(error.message);
        res.json({sucess: false, message: error.message})
    }
}

//send message to selected user...........
export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body;
        const reveiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResopnse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResopnse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        //Emit the new message to the receiver's socket....
        const receiverSocketId = userSoketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({sucess: true, newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({sucess: false, message: error.message})
    }
}