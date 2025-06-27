import React, { useEffect, useRef } from 'react';
import styles from "./ChatWindow.module.scss";
import Message from '../Message/Message';
import Recipe from '../Recipe/Recipe'
import { useChat } from '../../utils/useChat';

function ChatWindow({messages, chatTitle, isLoadingRecipe, currentRoomId}) {
    const messagesEndRef = useRef(null);
    const { sendRecipeDetail } = useChat();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoadingRecipe]);

    const handleRecipeClick = (roomId, recipe) => {
        sendRecipeDetail(roomId, recipe);
    };

    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>
                <div className={styles.chatWindow__header}>{chatTitle || "새 채팅방"}</div>
                <div className={styles.chatWindow__content}>
                    {messages.map((msg, idx) => (
                        <Message
                            key={idx}
                            {...msg}
                            roomId={currentRoomId}
                            onRecipeClick={handleRecipeClick}
                        />
                    ))}
                    {isLoadingRecipe && <Recipe />}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatWindow;