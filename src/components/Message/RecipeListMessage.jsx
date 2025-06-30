import React, { useState } from 'react';
import styles from "./Message.module.scss";
import RecipeDetailMessage from './RecipeDetailMessage';

function RecipeListMessage({role, recipes, roomId, onRecipeClick }) {
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const handleClick = (recipe) => {
        if (selectedRecipe?.title === recipe.title) {
            setSelectedRecipe(null);
        } else {
            setSelectedRecipe(recipe);
            if (!recipe.hasDetailedInfo && typeof onRecipeClick === 'function') {
                onRecipeClick(roomId, recipe);
            }
        }
    };

    return (
        <div className={styles.recommendationHeader}>
            {selectedRecipe === null && (
                <>
                    <h4>🍽️ 추천 메뉴</h4>
                    <p>원하는 메뉴를 클릭하면 상세 레시피를 확인할 수 있습니다</p>
                </>
            )}

            <div className={styles.recipeListBox}>
                {recipes.map((r, i) => (
                    <div key={i} className={styles.recipeItem}>
                        <button
                            className={`${styles.recipeTitleBtn} ${selectedRecipe?.title === r.title ? styles.expanded : ''}`}
                            onClick={() => handleClick(r)}
                        >
                            <div className={styles.recipeBtnContent}>
                                <span className={styles.recipeBtnTitle}>{r.title}</span>
                                <div className={styles.recipeBtnMeta}>
                                    <span className={styles.recipeBtnCategory}>{r.category}</span>
                                    <span className={styles.recipeBtnTime}>⏱️ {r.cookingTime}</span>
                                    <span className={styles.recipeBtnDifficulty}>🔥 {r.difficulty}</span>
                                </div>
                                <span className={styles.toggleIcon}>
                                    {selectedRecipe?.title === r.title ? '▼' : '▶'}
                                </span>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

             {/* 선택된 레시피가 있을 때만 상세내용 표시 */}
            {selectedRecipe?.hasDetailedInfo && (
                <RecipeDetailMessage
                    role={role}
                    recipe={selectedRecipe}
                />
            )}
        </div>
    );
}

export default RecipeListMessage;