import React from 'react';
import styles from "./Chatwindow.module.scss";

function ChatWindow({handleIngredientClick}) {
    return (
        <div className={styles.chatContainer}>
            <div className= {styles.chatWindow}>여기에 채팅창</div>
                <div className={styles.chatInput}>
                    <button onClick={handleIngredientClick}>냉장고 재료</button>
                    <input type="text" placeholder="메세지를 입력하세요." />
                    <button>전송</button>
            </div>
        </div>
    )
}

export default ChatWindow;