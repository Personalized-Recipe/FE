import React,{ useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow.jsx";
import ChatInput from "../../components/ChatInput/ChatInput";
import { useChat } from "../../utils/useChat.js";
import { useIngre } from "../../utils/useIngre.js";
import { sortByCreatedAt } from "../../utils/sort";

function Main() {
    const {
        messages, setMessages,
        chatTitle, setChatTitle,
        input, setInput,
        isLoadingRecipe, setIsLoadingRecipe,
        sendMessage
    } = useChat();

    const [currentRoomId, setCurrentRoomId] = useState(null);

    const {
        ingredients, setIngredients, showIngredient, handleIngredientClick
    } = useIngre();

    const handleSelectChat = (room) => {
        setMessages(room.messages || []);
        setChatTitle(room.title);
        setCurrentRoomId(room.id);
        setInput('');
        setIsLoadingRecipe(false); // 초기화
        setCurrentRoomId(room.id);
    };

    const handleSend = () => {
        sendMessage(currentRoomId);
    }

    const handleSort = (order) => {
        const sorted = sortByCreatedAt(ingredients, order);
        console.log("정렬 후:", sorted);
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