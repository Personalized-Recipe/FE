import React, { useState} from 'react';
import styles from "./Chatwindow.module.scss";
import Message from '../Message/Message';
import { handleSend } from '../../utils/chatutils';
import Recipe from '../Recipe/Recipe';

function ChatWindow({handleIngredientClick}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>
                <div className={styles.chatWindow__header}>채팅방 제목</div>
                <div className={styles.chatWindow__content}>
                    {messages.map((msg, idx) => (
                    <Message 
                        key={idx} 
                        role={msg.role} 
                        content={msg.content} 
                    />
                    ))}
                    <Recipe />
                </div>
            </div>
            <div className={styles.chatInput}>
                <button onClick={handleIngredientClick}>냉장고 재료</button>
                <input
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey){
                            e.preventDefault();
                            handleSend({input, setInput, messages, setMessages });
                            }
;                        }}
                    placeholder="메세지를 입력하세요." 
                />
                <button onClick={() => handleSend({input, setInput, messages, setMessages })}>전송</button>
            </div>
        </div>
    )
}

export default ChatWindow;