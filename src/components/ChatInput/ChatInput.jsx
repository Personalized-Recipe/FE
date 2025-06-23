import React from "react";
import styles from "./ChatInput.module.scss";

function ChatInput({input, setInput, onSend, onToggleIngredient}) {
    return(
        <div className={styles.chatInput}>
            <label className={styles["hover-area"]}>
                <input
                    type="checkbox"
                    className={styles["checkbox"]}
                    onChange={onToggleIngredient}
                />
                <span className={styles["label-text"]}>냉장고</span>
                <div className={styles["tooltip"]}>
                    내가 등록한 재료를 기반으로 추천을 받을 수 있어요
                </div>
            </label>
            <input
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey){
                        e.preventDefault();
                        onSend();
                        }
                   }}
                placeholder="메세지를 입력하세요." 
            />
            <button onClick={onSend}>전송</button>
        </div>
    )
}

export default ChatInput;