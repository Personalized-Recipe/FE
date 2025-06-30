import React, { useState, useEffect } from "react";
import styles from './MyRecipe.module.scss';
import axios from "axios";

function MyRecipe() {
    const [myRecipes, setMyRecipes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 저장된 레시피 목록 가져오기
    const fetchMyRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem("jwt");
            const userId = localStorage.getItem("userId");
            
            if (!token || !userId) {
                setError("로그인이 필요합니다.");
                return;
            }
            
            const response = await axios.get(`/api/recipes/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // UserRecipe 목록을 Recipe 상세 정보로 변환
            const recipePromises = response.data.map(async (userRecipe) => {
                try {
                    const recipeResponse = await axios.get(`/api/recipes/${userRecipe.recipeId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    return recipeResponse.data;
                } catch (error) {
                    console.error(`레시피 ${userRecipe.recipeId} 조회 실패:`, error);
                    return null;
                }
            });
            
            const recipes = await Promise.all(recipePromises);
            const validRecipes = recipes.filter(recipe => recipe !== null);
            
            setMyRecipes(validRecipes);
        } catch (error) {
            console.error("저장된 레시피 조회 실패:", error);
            setError("저장된 레시피를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 레시피 삭제
    const handleDelete = async () => {
        if (selected === null) return;

        try {
            const token = localStorage.getItem("jwt");
            const userId = localStorage.getItem("userId");
            const recipeId = myRecipes[selected].recipeId;
            
            if (!token || !userId) {
                alert("로그인이 필요합니다.");
                return;
            }
            
            await axios.delete(`/api/recipes/delete/${userId}/${recipeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            alert("레시피가 삭제되었습니다.");
            setSelected(null);
            // 목록 새로고침
            fetchMyRecipes();
        } catch (error) {
            console.error("레시피 삭제 실패:", error);
            alert("레시피 삭제에 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    if (loading) {
        return (
            <div className={styles.myrecipe}>
                <p className={styles.myrecipe__header}>📖 나의 레시피 북 📖</p>
                <div className={styles.myrecipe__content}>
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.myrecipe}>
                <p className={styles.myrecipe__header}>📖 나의 레시피 북 📖</p>
                <div className={styles.myrecipe__content}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button onClick={fetchMyRecipes}>다시 시도</button>
                </div>
            </div>
        );
    }

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