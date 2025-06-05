import React,{ useState } from "react";
import styles from "./Sidebar.module.scss";
import ChatList from "../ChatList/ChatList";

function Sidbar({showIngredient, ingredients, onSelectChat, onSort}) {
    const [sortOrder, setSortOrder] = useState("recent");

    const handleSort = () => {
        const newOrder = sortOrder === "recent" ? "oldest" : "recent";
        onSort(newOrder);
        setSortOrder(newOrder);
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar__header}>채팅 목록</div>
                {showIngredient ? (
                    <div className={styles.MyIngreContainer}>
                        <div className={styles.MyIngreContainer__header}>
                            냉장고 재료 보기
                            <div className={styles.sortButton} onClick={handleSort}>
                                {sortOrder === "recent" ? "최신순" : "오래된순"}
                            </div>
                        </div>
                        <div className={styles.MyIngreContainer__content}>
                            {ingredients.map((item, idx) => (
                            <div className={styles.item} key={idx}>{item.name} - {item.amount} {item.unit}</div>
                            ))} 
                        </div>
            
                    </div>
                )
                : (<ChatList onSelectChat={onSelectChat}/>)}
        </div>
    );
}

export default Sidbar;