import React, { useEffect, useRef } from 'react';
import styles from "./ChatWindow.module.scss";
// import Message from '../Message/Message';
import Message from '../Message';
import { useChat } from '../../utils/useChat';

function ChatWindow({messages, chatTitle, isLoadingRecipe, currentRoomId, showIngredient, input}) {
    const messagesEndRef = useRef(null);
    const { sendRecipeDetail } = useChat();

    // 디버깅 로그 추가
    console.log("ChatWindow 렌더링:", { 
        messagesCount: messages.length, 
        isLoadingRecipe, 
        currentRoomId,
        showIngredient
    });

    // 로딩 상태 변경 감지
    useEffect(() => {
        console.log("ChatWindow - isLoadingRecipe 변경:", isLoadingRecipe);
    }, [isLoadingRecipe]);

    const scrollToBottom = () => {
        console.log("스크롤을 맨 아래로 이동합니다.");
        setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        console.log("스크롤 효과 실행:", messages.length, "개 메시지");
        scrollToBottom();
    }, [messages, isLoadingRecipe]);

    const handleRecipeClick = (roomId, recipe) => {
        console.log("=== 레시피 클릭 시작 ===");
        console.log("레시피 클릭:", recipe.title);
        console.log("roomId:", roomId);
        console.log("recipe 객체:", recipe);
        console.log("showIngredient:", showIngredient);
        console.log("sendRecipeDetail 함수:", typeof sendRecipeDetail);
        console.log("현재 입력값:", input);
        
        try {
            sendRecipeDetail(roomId, recipe, showIngredient, input);
            console.log("sendRecipeDetail 호출 완료");
        } catch (error) {
            console.error("sendRecipeDetail 호출 실패:", error);
        }
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
                            messageIndex={idx}
                    />
                    ))}
                    {isLoadingRecipe && (
                        <div className={styles.loadingMessage}>
                            <div className={styles.loadingSpinner}></div>
                            <p>레시피를 찾고 있습니다...</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatWindow;