import React,{ useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";
import { useChat } from "../../utils/useChat.js";
import { useIngre } from "../../utils/useIngre.js";

function Main() {
    const {
        currentRoomId, setCurrentRoomId,
        input, setInput,
        isLoadingRecipe, setIsLoadingRecipe,
        sendMessage,
        createChatRoom,
        chatRooms,
        updateChatTitle
    } = useChat();

    const { ingredients, handleIngredient } = useIngre();
    const [showIngredient, setShowIngredient] = useState(false);

     // 현재 선택된 방의 messages 
    const currentRoom = chatRooms.find(room => room.id === currentRoomId);
    const messages = currentRoom ? currentRoom.messages : [];
    const chatTitle = currentRoom ? currentRoom.title : '새 채팅방';

    const handleToggleIngredient = () => {
        handleIngredient();
        setShowIngredient(prev => !prev);
    };

    const handleSelectChat = (room) => {
        setCurrentRoomId(room.id);
        setInput('');
        setIsLoadingRecipe(false); // 초기화
    };

    // 새 채팅방 생성
    const handleCreateChatRoom = () => {
        createChatRoom();
    };

    // 채팅 메시지 전송
    const handleSend = () => {
        sendMessage(currentRoomId);
        console.log("채팅 전송")
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
                    onUpdateTitle={updateChatTitle}
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