import React from "react";
import styles from "./ChatInput.module.scss";

function ChatInput({input, setInput, onSend, handleIngredientClick}) {
    return(
        <div className={styles.chatInput}>
            <button onClick={handleIngredientClick}>냉장고 재료</button>
            <input
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey){
                        e.preventDefault();
                        onSend();
                        }
;                   }}
                placeholder="메세지를 입력하세요." 
            />
            <button onClick={onSend}>전송</button>
        </div>
    )
}

export default ChatInput;