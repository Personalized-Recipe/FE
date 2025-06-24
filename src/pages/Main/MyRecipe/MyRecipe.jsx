import React, { useState, useEffect } from "react";
import styles from './MyRecipe.module.scss';
import useList from "../../../utils/useList";

function MyRecipe() {
    const stored = () => {
        return JSON.parse(localStorage.getItem("myRecipes")) || [];
    }

    const [selected, setSelected] = useState(null);
    const [myRecipes, , ,removeRecipe,] = useList(stored(),['id']);

    useEffect(() => {
        localStorage.setItem("myRecipes", JSON.stringify(myRecipes));
    }, [myRecipes]);

    const handleDelete = () => {
        if (selected === null) return;

        setSelected(null);
        removeRecipe(selected);
    };

    return(
        <div className={styles.myrecipe}>
            <p className={styles.myrecipe__header}>📖 나의 레시피 북 📖</p>
            <div className={styles.myrecipe__content}>
                <div className={styles.recipe__list}>{myRecipes.length === 0 ? (
                        <p>저장된 레시피가 없습니다. 레시피를 추가해보세요!</p>
                    ) : (
                        myRecipes.map((r, idx) => (
                            <div className={`${styles.recipe} ${selected === idx ? styles.active : ''}`} 
                            key={r.id || idx} 
                            onClick={() => setSelected(idx)}
                            >
                                {r.title}
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.recipe__info}>
                    {selected !== null ? (
                        <>
                            <h3>{myRecipes[selected].title}</h3>
                            <p>{myRecipes[selected].content}</p>
                            <button className={styles["recipe-delete"]} onClick={handleDelete}>내 레시피 북에서 지우기</button>
                        </>
                    ) : (
                        <p>레시피를 선택하세요🕴️🕴️</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyRecipe;