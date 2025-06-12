import React,{ useState, useEffect } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";
import { useChat } from "../../utils/useChat.js";
import { useIngre } from "../../utils/useIngre.js";
import { sortByCreatedAt } from "../../utils/sort";
import { createChatRoom } from "../../utils/createChatRoom.js";

function Main() {
    const {
        messages, setMessages,
        chatTitle, setChatTitle,
        input, setInput,
        isLoadingRecipe, setIsLoadingRecipe,
        sendMessage
    } = useChat();
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const {
        ingredients, setIngredients, showIngredient, handleIngredientClick
    } = useIngre();

    // 채팅방 목록 동기화
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("chatRooms")) || [];
        setChatRooms(stored);
    }, [messages]);

    const handleSelectChat = (room) => {
        setMessages(room.messages || []);
        setChatTitle(room.title);
        setCurrentRoomId(room.id);
        setInput('');
        setIsLoadingRecipe(false); // 초기화
    };

    const handleSend = () => {
        sendMessage(currentRoomId);
    }

    // 새 채팅방 생성
    const handleCreateChatRoom = () => {
        const {newRoom, updatedRooms } = createChatRoom(chatRooms);
        setChatRooms(updatedRooms);
        handleSelectChat(newRoom);
    }

    // 냉장고 재료 졍렬
    const handleSort = (order) => {
        const sorted = sortByCreatedAt(ingredients, order);
        setIngredients(sorted);
        localStorage.setItem("MyIngre", JSON.stringify(sorted));
    }

    return (
        <div className={styles.main}>
            <Navbar />
            <div className={styles.main__content}>
                <Sidebar 
                    showIngredient={showIngredient} 
                    ingredients={ingredients} 
                    onSelectChat={handleSelectChat} 
                    onSort={handleSort} 
                    chatRooms={chatRooms}
                    onCreateChatRoom={handleCreateChatRoom}
                />
                <div className={styles.main__chat}>
                    <ChatWindow messages={messages} chatTitle={chatTitle} isLoadingRecipe={isLoadingRecipe} />  
                    <ChatInput 
                        input={input}
                        setInput={setInput}
                        messages={messages} 
                        setMessages={setMessages} 
                        handleIngredientClick={handleIngredientClick} 
                        onSend={handleSend}
                    />
                </div>
            </div>
        </div>
    )
}

export default Main;