import React, { useState, useEffect } from "react";
import styles from "./Sidebar.module.scss";

function Sidbar({showIngredient, ingredients, onSelectChat}) {
    const [chatRooms, setChatRooms] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("chatRooms")) || [];
        const sorted = stored.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setChatRooms(sorted);
    },[]);

    const handleRoomClick = (room) => {
        onSelectChat(room);
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar__header}>채팅 목록</div>
                {showIngredient ? (
                    <div className={styles.MyIngreContainer}>
                        <div className={styles.MyIngreContainer__header}>
                            냉장고 재료 보기
                            <div className={styles.sortButton}>정렬</div>
                        </div>
                        <div className={styles.MyIngreContainer__content}>
                            {ingredients.map((item, idx) => (
                            <div className={styles.item} key={idx}>{item.name} - {item.amount} {item.unit}</div>
                            ))} 
                        </div>
            
                    </div>
                )
                : (
                    <div className={styles.sidebar__content}>
                        {chatRooms.map(room => (
                            <div key={room.id} className={styles.room} onClick={() => handleRoomClick(room)}>
                                {room.title}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

export default Sidbar;