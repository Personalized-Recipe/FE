import React from "react";
import styles from './MyRecipe.module.scss';

function MyRecipe() {
    return(
        <div className={styles.myrecipe}>
            <div>나의 레시피 북</div>
            <div className={styles.myrecipe__content}>
                <div>레시피 목록</div>
                <div>레시피 내용</div>
            </div>

        </div>
    )
}

export default MyRecipe;