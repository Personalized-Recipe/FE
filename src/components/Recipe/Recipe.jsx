import React, { useEffect, useState } from "react";
import styles from "./Recipe.module.scss";

function Recipe() {
    const [recipes, setRecipes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleSave = () => {
        if (selected === null) return;

        const saved = JSON.parse(localStorage.getItem("myRecipes") || "[]");
        const current = recipes[selected];

        // 중복 저장 방지 (id로 비교)
        const already = saved.find(r => r.id === current.id);
        if (already) {
            alert("이미 저장된 레시피입니다.");
            return;
        }

        const updated = [...saved, current];
        localStorage.setItem("myRecipes", JSON.stringify(updated));
        alert("레시피가 저장되었습니다");
    }

    useEffect(() => {
        // 여기에 레시피 데이터를 가져오는 로직을 추가
        const dummyRecipes = [
        {
            id: 1,
            title: "김치찌개",
            content: "돼지고기와 김치를 넣고 푹 끓인 매콤한 찌개로, 밥과 함께 먹기 좋습니다."
        },
        {
            id: 2,
            title: "된장찌개",
            content: "된장, 애호박, 두부, 양파 등을 넣어 구수하게 끓인 찌개입니다. 집밥의 대표 메뉴입니다."
        },
        {
            id: 3,
            title: "비빔밥",
            content: "다양한 채소와 고기, 고추장을 넣고 비벼먹는 한국의 대표적인 한 그릇 음식입니다."
        },
        {
            id: 4,
            title: "불고기",
            content: "간장 양념에 재운 소고기를 구워낸 달콤짭짤한 요리로, 밥반찬이나 쌈과 잘 어울립니다."
        },
        {
            id: 5,
            title: "김밥",
            content: "김 위에 밥과 다양한 속재료를 얹고 돌돌 말아 썬 간편한 한 끼 식사입니다."
        }
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
                        key = {recipe.id}
                        className = {`${styles.recipeBlock}`}
                        onClick={() => setSelected(idx)}
                    >
                       {recipe.title} 
                    </div>
                ))}
            </div>
            <div className={styles.recipe__content}>
                {selected !== null && recipes[selected] ? (
                    <>
                        {/* <h2>{recipes[selected].title}</h2> */}
                        <div className={styles.recipeDetail}>{recipes[selected].content}</div>
                        <div className={styles.buttonRow}>
                            <button onClick={() => setSelected(null)}>뒤로가기</button>
                            <button className={styles.saveBtn} onClick={handleSave}>저장하기</button>
                        </div>
                    </>
                ) : (
                    <p>레시피를 클릭해</p>
                )}
            </div>
        </div>
    )
}
export default Recipe;