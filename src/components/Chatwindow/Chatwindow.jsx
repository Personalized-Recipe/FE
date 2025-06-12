import React from 'react';
import styles from "./ChatWindow.module.scss";
import Message from '../Message/Message';
import Recipe from '../Recipe/Recipe'

function ChatWindow({messages, isLoadingRecipe}) {
    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>
                <div className={styles.chatWindow__header}>{messages.length > 0 ? messages[0].content : "새 채팅방"}</div>
                <div className={styles.chatWindow__content}>
                    {messages.map((msg, idx) => (
                    <Message 
                        key={idx} 
                        role={msg.role} 
                        content={msg.content} 
                    />
                    ))}
                    {isLoadingRecipe && <Recipe />}
                </div>
            </div>
        </div>
    )
}

export default ChatWindow;