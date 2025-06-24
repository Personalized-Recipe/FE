import React,{ useState } from "react";
import styles from "./Sidebar.module.scss";
import ChatList from "../ChatList/ChatList";
import { sortByCreatedAt } from "../../utils/sort";

function Sidebar({chatRooms, onSelectChat, onCreateChatRoom, showIngredient, ingredients, onUpdateTitle}) {
    const [sortOrder, setSortOrder] = useState("recent");
    

    const handleSort = () => {
        const newOrder = sortOrder === "recent" ? "oldest" : "recent";
        setSortOrder(newOrder);
    }

    const sortedIngredients = sortByCreatedAt(ingredients, sortOrder);

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar__header}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024">
                    <path fill="currentColor" d="m174.72 855.68l135.296-45.12l23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160S128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8l-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512C64 299.904 256 96 512 96s448 203.904 448 416s-192 416-448 416a461.06 461.06 0 0 1-206.912-48.384l-175.616 58.56z" stroke="currentColor" />
                    <path fill="currentColor" d="M512 563.2a51.2 51.2 0 1 1 0-102.4a51.2 51.2 0 0 1 0 102.4m192 0a51.2 51.2 0 1 1 0-102.4a51.2 51.2 0 0 1 0 102.4m-384 0a51.2 51.2 0 1 1 0-102.4a51.2 51.2 0 0 1 0 102.4" stroke="currentColor" />
                </svg>
                <button className={styles.createChatBtn} onClick={onCreateChatRoom}>
                    +
                </button>
            </div>
                {showIngredient ? (
                    <div className={styles.MyIngreContainer}>
                        <div className={styles.MyIngreContainer__header}>
                            <p>냉장고 재료</p>
                            <div className={styles.sortButton} onClick={handleSort}>
                                {sortOrder === "recent" ? "최신순" : "오래된순"}
                            </div>
                        </div>
                        <div className={styles.MyIngreContainer__content}>
                            {sortedIngredients.map((item) => (
                                <div className={styles.item} key={item.createdAt}>
                                    {item.name} - {item.amount} {item.unit}
                                </div>
                            ))} 
                        </div>
                    </div>
                )
                : (<ChatList 
                        chatRooms={chatRooms} 
                        onSelectChat={onSelectChat}
                        onUpdateTitle={onUpdateTitle}
                    />)}
        </div>
    );
}

export default Sidebar;