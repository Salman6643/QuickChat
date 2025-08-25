import { Children, createContext, use, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";






export const ChatContext = createContext();

export const ChatProvider = ({ Children}) =>{

    const [message, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    //function to get all susers for sidebar...
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    //function to get message for selected user....
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/message/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
            }else{
                toast.error(error.message);
            }
        } catch (error) {
            toast.error(error.message);            
        }
    }

    ///function to subscribe to message for selected user.........
    const subscribeToMessage = async () => {
        if (!socet) return;

        socket.io("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((precUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //function to unsubscribe from messages..........
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");

    }
    useEffect(() => {
        subscribeToMessage();
        return () => unsubscribeFromMessages();
    },[socket, selectedUser])


    const value = {
        message, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }


    return (
        <ChatContext.Provider value={value}>
            { Children }
        </ChatContext.Provider>
    )
}
