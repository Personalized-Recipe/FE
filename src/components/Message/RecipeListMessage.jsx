import React, { useState, useEffect } from 'react';
import styles from "./Message.module.scss";
import RecipeDetailMessage from './RecipeDetailMessage';

function RecipeListMessage({role, recipes, roomId, onRecipeClick, messageIndex }) {
        console.log("🧪 전체 recipes 디버깅 시작");
        recipes.forEach((r, i) => {
        console.log(`레시피 ${i}번`, {
            title: r.title,
            recipeId: r.recipeId,
            description: r.description,
            imageUrl: r.imageUrl,
            hasDetailedInfo: r.hasDetailedInfo,
        });
        });

    // messageIndex + recipeTitle 조합을 키로 사용해 토글 상태 관리
    const storageKey = `expandedRecipes_${roomId}_${messageIndex}`;
    const [expandedKey, setExpandedKey] = useState(() => {
        try {
            return localStorage.getItem(storageKey) || null;
        } catch{
            return null;
        }
    });

    const [activeRecipe, setActiveRecipe] = useState(null);

    useEffect(() => {
        if (expandedKey) {
            localStorage.setItem(storageKey, expandedKey);
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [expandedKey, storageKey]);

    useEffect(() => {
        const recipe = recipes.find(r => `${messageIndex}-${r.title}` === expandedKey);
        setActiveRecipe(recipe || null);
    }, [expandedKey, recipes, messageIndex]);

    useEffect(() => {
    if (activeRecipe) {
        console.log("🟢 활성 레시피 변경됨:", activeRecipe);
    } else {
        console.log("🟡 레시피 닫힘 (activeRecipe = null)");
    }
}, [activeRecipe]);


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

            {activeRecipe && (
               <RecipeDetailMessage 
                    key={activeRecipe.recipeId}
                    role={role}
                    recipe={activeRecipe}
               />
            )}
        </div>
    </>
);

}

export default RecipeListMessage;