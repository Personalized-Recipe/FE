import React, { useEffect, useState } from "react";
import styles from "./Recipe.module.scss";

function Recipe() {
    const [recipes, setRecipes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 여기에 레시피 데이터를 가져오는 로직을 추가
        const dummyRecipes = [
            { id: 1, title: "레시피 1", content: "레시피 내용 1" },
            { id: 2, title: "레시피 2", content: "레시피 내용 2" },
            { id: 3, title: "레시피 3", content: "레시피 내용 3" },
            { id: 4, title: "레시피 4", content: "레시피 내용 4" },
            { id: 5, title: "레시피 5", content: "레시피 내용 5" },
        ];
        setRecipes(dummyRecipes);
        setLoading(false);
    }, []);

    if (loading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    return (
        <div className={styles.recipeContainer}>
            <div className={styles.recipeBlockContainer}>
                {recipes.map((recipe, idx) => (
                    <div
                        key = {recipe.id || idx}
                        className = {`${styles.recipeBlock}`}
                        onClick={() => setSelected(idx)}
                    >
                       {recipe.title} 
                    </div>
                ))}
            </div>
            <div className={styles.recipe__content}>
                {selected !== null ? (
                    <div className={styles.recipeDetailContainer}>
                        <h2>{recipes[selected].title}</h2>
                        <div className={styles.recipeDetail}>{recipes[selected].content}</div>
                        <div className={styles.buttonRow}>
                            <button onClick={() => setSelected(null)}>뒤로가기</button>
                            <button>저장하기</button>
                        </div>
                    </div>
                ) : (
                    <p>레시피를 클릭해</p>
                )}
            </div>
        </div>
    )
}
export default Recipe;