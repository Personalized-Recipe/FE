import React, { useEffect, useRef } from 'react';
import styles from "./ChatWindow.module.scss";
import Message from '../Message/Message';
import Recipe from '../Recipe/Recipe'

function ChatWindow({messages, chatTitle, isLoadingRecipe}) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoadingRecipe]);

    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>
                <div className={styles.chatWindow__header}>{chatTitle || "새 채팅방"}</div>
                <div className={styles.chatWindow__content}>
                    {messages.map((msg, idx) => (
                    <Message 
                        key={idx} 
                        role={msg.role} 
                        content={msg.content} 
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