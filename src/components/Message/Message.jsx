import React, { useState } from 'react';
import styles from "./Message.module.scss";

function Message({ role, content, type, recipes, recipe, onRecipeClick, roomId }) {
    const [imageError, setImageError] = useState(false);
    
    // 디버깅 로그 추가
    console.log("Message 컴포넌트 렌더링:", { role, content, type, recipes, recipe });
    
    // type이 undefined인 경우 기본값 설정
    const messageType = type || 'text';
    
    // content가 undefined인 경우 기본값 설정
    const messageContent = content || '';
    
    // 줄바꿈을 <br> 태그로 변환
    const formatContent = (text) => {
        // text가 undefined, null, 또는 빈 문자열인 경우 처리
        if (!text || typeof text !== 'string') {
            console.warn("formatContent: text가 유효하지 않습니다:", text);
            return <span>메시지 내용이 없습니다.</span>;
        }
        
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    // 레시피 리스트 메시지 (요리명 버튼들)
    if (messageType === 'recipe-list' && Array.isArray(recipes)) {
        console.log("레시피 리스트 메시지 렌더링");
        return (
            <div className={`${styles.message} ${role === 'user' ? styles.userMessage : styles.botMessage}`}>
                <div className={styles.recommendationHeader}>
                    <h4>🍽️ 추천 메뉴</h4>
                    <p>원하는 메뉴를 클릭하면 상세 레시피를 확인할 수 있습니다</p>
                </div>
                <div className={styles.recipeListBox}>
                    {recipes.map((r, i) => (
                        <button
                            key={i}
                            className={styles.recipeTitleBtn}
                            onClick={() => onRecipeClick(roomId, r)}
                        >
                            <div className={styles.recipeBtnContent}>
                                {r.imageUrl && (
                                    <div className={styles.recipeBtnImage}>
                                        <img src={r.imageUrl} alt={r.title} />
                                    </div>
                                )}
                                <span className={styles.recipeBtnTitle}>{r.title}</span>
                                <div className={styles.recipeBtnMeta}>
                                    <span className={styles.recipeBtnCategory}>{r.category}</span>
                                    <span className={styles.recipeBtnTime}>⏱️ {r.cookingTime}</span>
                                    <span className={styles.recipeBtnDifficulty}>🔥 {r.difficulty}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 레시피 상세 메시지 (이미지, 카테고리, 조리시간, 난이도 포함)
    if (messageType === 'recipe-detail' && recipe) {
        console.log("=== 레시피 상세 메시지 렌더링 시작 ===");
        console.log("레시피 상세 메시지 렌더링:", recipe.title);
        console.log("type:", messageType);
        console.log("recipe:", recipe);
        console.log("=== 레시피 상세 메시지 렌더링 완료 ===");
        
        return (
            <div className={`${styles.message} ${role === 'user' ? styles.userMessage : styles.botMessage}`}>
                <div className={styles.recipeDetailBox}>
                    <div className={styles.recipeHeader}>
                        <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                        <div className={styles.recipeMeta}>
                            <span className={styles.recipeCategory}>{recipe.category}</span>
                            <span className={styles.recipeTime}>⏱️ {recipe.cookingTime}분</span>
                            <span className={styles.recipeDifficulty}>난이도: {recipe.difficulty}</span>
                        </div>
                    </div>
                    {(recipe.imageUrl && !imageError) ? (
                        <div className={styles.recipeImage}>
                            <img 
                                src={recipe.imageUrl} 
                                alt={recipe.title}
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div className={styles.recipeImagePlaceholder}>
                            <div className={styles.placeholderContent}>
                                <span className={styles.placeholderIcon}>🍽️</span>
                                <span className={styles.placeholderText}>레시피 이미지</span>
                            </div>
                        </div>
                    )}
                    <div className={styles.recipeDescription}>
                        {formatContent(recipe.description)}
                    </div>
                </div>
            </div>
        );
    }

    // 기존 일반 메시지 (text 타입 또는 type이 없는 경우)
    console.log("일반 메시지 렌더링:", { role, content, type: messageType });
    return (
        <div className={`${styles.message}`}>
            <div className={`${styles.message__content} ${role === 'user' ? styles.user : styles.bot}`}>
                {formatContent(messageContent)}
            </div>
        </div>
    );
}

export default Message;