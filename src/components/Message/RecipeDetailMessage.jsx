import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./Message.module.scss";

function RecipeDetailMessage({ role, recipe }) {
    const [saving, setSaving] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setSaving(false);
        setImageError(false);
    }, [recipe]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("jwt");
            const userId = localStorage.getItem("userId");

            if (!token || !userId || !recipe.recipeId) {
                alert("저장할 수 없습니다.");
                return;
            }

            const response = await axios.post(`/api/recipes/save/${userId}/${recipe.recipeId}`, {}, {
                headers: {
                     'Authorization': `Bearer ${token}` ,
                     'Content-Type': `application/json`
                }
            });

            if (response.status === 200) {
                alert("레시피가 저장되었습니다!");
            } else {
                alert("레시피 저장에 실패했습니다.")
            }
        } catch (error) {
            console.error("레시피 저장 중 오류:", error);
            if (error.response?.status === 409) {
                alert("이미 저장된 레시피입니다.");
            } else {
                alert("레시피 저장에 실패했습니다.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.recipeDetailBox}>
            <h3 className={styles.recipeTitle}>{recipe.title}</h3>
            <div className={styles.recipeMeta}>
                <span>{recipe.category}</span>
                <span>⏱️ {recipe.cookingTime}분</span>
                <span>난이도: {recipe.difficulty}</span>
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
                    <span>이미지 없음</span>
                </div>
            )}
            <div className={styles.recipeDescription}>
                {recipe.description}
            </div>
            <div className={styles.recipeActions}>
                <button 
                    className={styles.saveRecipeBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '💾 저장 중...' : '💾 저장하기'}
                </button>
            </div>
        </div>
    );
}

export default RecipeDetailMessage;