import React, { useState, useEffect } from 'react';
import styles from "./Message.module.scss";
import RecipeDetailMessage from './RecipeDetailMessage';

function RecipeListMessage({role, recipes, roomId, onRecipeClick, messageIndex }) {
    // messageIndex + recipeTitle 조합을 키로 사용해 토글 상태 관리
    const storageKey = `expandedRecipes_${roomId}_${messageIndex}`;
    const [expandedKey, setExpandedKey] = useState(() => {
        try {
            return localStorage.getItem(storageKey) || null;
        } catch{
            return null;
        }
    });

    useEffect(() => {
        if (expandedKey) {
            localStorage.setItem(storageKey, expandedKey);
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [expandedKey, storageKey]);

    const toggleRecipe = (recipe) => {
        const recipeKey = `${messageIndex}-${recipe.title}`;
        const isSame = expandedKey === recipeKey;

        if (isSame) {
        setExpandedKey(null);
        return;
        }

        if (!recipe.hasDetailedInfo && typeof onRecipeClick === 'function') {
            onRecipeClick(roomId, recipe);
        }

        setExpandedKey(recipeKey);
    };
    
    const selectedRecipe = recipes.find(r => {
        const key = `${messageIndex}-${r.title}`;
        console.log("비교 중", key, expandedKey);
        return key === expandedKey;
    });

    return (
    <>
        <div className={styles.recipeListBox}>
            {recipes.map((r, i) => {
                const recipeKey = `${messageIndex}-${r.title}`;
                const isExpanded = expandedKey === recipeKey;

                return (
                    <div key={i} className={styles.recipeItem}>
                        <button
                            className={`${styles.recipeTitleBtn} ${isExpanded ? styles.expanded : ''}`}
                            onClick={() => toggleRecipe(r)}
                        >
                            <div className={styles.recipeBtnContent}>
                                <span className={styles.recipeBtnTitle}>{r.title}</span>
                                <div className={styles.recipeBtnMeta}>
                                    <span className={styles.recipeBtnCategory}>{r.category}</span>
                                    <span className={styles.recipeBtnTime}>⏱️ {r.cookingTime}</span>
                                    <span className={styles.recipeBtnDifficulty}>🔥 {r.difficulty}</span>
                                </div>
                                <span className={styles.toggleIcon}>
                                    {isExpanded ? '▼' : '▶'}
                                </span>
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>

        <div className={styles.recommendationHeader}>
            {/* 레시피 확장된게 없을 때 제목/설명 표시 */}
            {!expandedKey && (
                <>
                    <h4>🍽️ 추천 메뉴</h4>
                    <p>원하는 메뉴를 클릭하면 상세 레시피를 확인할 수 있습니다</p>
                </>
            )}

            {selectedRecipe && (
               <RecipeDetailMessage 
                    key={expandedKey}
                    role={role}
                    recipe={selectedRecipe}
               />
            )}
        </div>
    </>
);

}

export default RecipeListMessage;