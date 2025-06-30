import React, { useState, useEffect } from "react";
import styles from './MyRecipe.module.scss';
import axios from "axios";
// import useList from "../../../utils/useList";

function MyRecipe() {
    // const stored = () => {
    //     return JSON.parse(localStorage.getItem("myRecipes")) || [];
    // }

    // if (!token || !userId) return;
    const token = localStorage.getItem("jwt");
    const userId = localStorage.getItem("userId");

    const [myRecipes, setMyRecipes] = useState([]);
    const [selected, setSelected] = useState(null);
    // const [myRecipes, , ,removeRecipe,] = useList(stored(),['id']);


    // useEffect(() => {
    //     localStorage.setItem("myRecipes", JSON.stringify(myRecipes));
    // }, [myRecipes]);

    // const handleDelete = () => {
    //     if (selected === null) return;

    //     setSelected(null);
    //     removeRecipe(selected);
    // };

    // 서버에서 저장된 레시피 목록 불러오기
    useEffect(() => {
        if (!token || !userId) return;

        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`/api/recipes/saved/${userId}`, {
                    headers: {
                     'Authorization': `Bearer ${token}` ,
                     'Content-Type': `application/json`
                    }
                });
                setMyRecipes(response.data);
            } catch (err) {
                console.error("레시피 목록 불러오기 실패:", err);
            }
        };
        fetchRecipes();
    }, [userId, token]);

    const handleDelete = async () => {
        if (selected === null) return;

        const recipeId = myRecipes[selected]?.recipeId;
        try {
            await axios.delete(`/api/recipes/delete/${userId}/${recipeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 삭제 후 목록에서 제거
            const updated = [...myRecipes];
            updated.splice(selected, 1);
            setMyRecipes(updated);
            setSelected(null);
        } catch (err) {
            console.error("레시피 삭제 실패:", err);
            alert("삭제 중 문제가 발생했습니다.");
        }
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
                            <p>{myRecipes[selected]?.description || "내용 없음"}</p>
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