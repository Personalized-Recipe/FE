import React from 'react';
import styles from "./ChatWindow.module.scss";
import Message from '../Message/Message';
import Recipe from '../Recipe/Recipe'

function ChatWindow({messages, chatTitle, isLoadingRecipe}) {
    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>
                <div className={styles.chatWindow__header}>{chatTitle || '채팅방 제목이 없습니다'}</div>
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