import React,{ useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";
import { useChat } from "../../utils/useChat.js";
import { useIngre } from "../../utils/useIngre.js";
import { createChatRoom } from "../../utils/createChatRoom.js";

function Main() {
    const {
        messages, setMessages,
        chatTitle, setChatTitle,
        input, setInput,
        isLoadingRecipe, setIsLoadingRecipe,
        sendMessage,
        chatRooms, setChatRooms
    } = useChat();

    const { ingredients, handleIngredient } = useIngre();
    const [showIngredient, setShowIngredient] = useState(false);

    const [currentRoomId, setCurrentRoomId] = useState(null);

    const handleToggleIngredient = () => {
        handleIngredient();
        setShowIngredient(prev => !prev);
    };

    const handleSelectChat = (room) => {
        setMessages(room.messages || []);
        setChatTitle(room.title);
        setCurrentRoomId(room.id);
        setInput('');
        setIsLoadingRecipe(false); // 초기화
    };

    const handleSend = () => {
        sendMessage(currentRoomId);
        console.log("채팅 전송")
    }

    // 새 채팅방 생성
    const handleCreateChatRoom = () => {
        const {newRoom, updatedRooms } = createChatRoom(chatRooms);
        setChatRooms(updatedRooms);
        handleSelectChat(newRoom);
    }

    return (
        <div className={styles.main}>
            <Navbar />
            <div className={styles.main__content}>
                <Sidebar 
                    showIngredient={showIngredient}
                    ingredients={ingredients}
                    onSelectChat={handleSelectChat} 
                    chatRooms={chatRooms}
                    onCreateChatRoom={handleCreateChatRoom}
                />
                <div className={styles.main__chat}>
                    <ChatWindow 
                    messages={messages} 
                    chatTitle={chatTitle} 
                    isLoadingRecipe={isLoadingRecipe} 
                    />  
                    <ChatInput 
                        input={input}
                        setInput={setInput}
                        onToggleIngredient={handleToggleIngredient}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </div>
    )
}

export default Main;