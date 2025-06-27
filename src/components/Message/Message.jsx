import React, { useState } from 'react';
import styles from "./Message.module.scss";

function Message({ role, content, type, recipes, recipe, onRecipeClick, roomId }) {
    const [imageError, setImageError] = useState(false);
    
    // 줄바꿈을 <br> 태그로 변환
    const formatContent = (text) => {
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    // 레시피 리스트 메시지 (요리명 버튼들)
    if (type === 'recipe-list' && Array.isArray(recipes)) {
        return (
            <div className={styles.message}>
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
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 레시피 상세 메시지 (이미지, 카테고리, 조리시간, 난이도 포함)
    if (type === 'recipe-detail' && recipe) {
        return (
            <div className={styles.message}>
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

    // 기존 일반 메시지
    return (
        <div className={`${styles.message}`}>
            <div className={`${styles.message__content} ${role === 'user' ? styles.user : styles.bot}`}>
                {formatContent(content)}
            </div>
        </div>
    );
}

export default Message;