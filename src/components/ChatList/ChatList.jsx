import React, { useState, useEffect } from "react";
import styles from './ChatList.module.scss';

function ChatList({onSelectChat}) {
    const [chatRooms, setChatRooms] = useState([]);
    
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("chatRooms")) || [];
        const sorted = stored.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setChatRooms(sorted);
    },[]);
    
    const handleRoomClick = (room) => {
        onSelectChat(room);
    }

    return(
        <div className={styles.chatList}>
            {chatRooms.map(room => (
                <div
                    key={room.id}
                    className={styles.room}
                    onClick={() => handleRoomClick(room)}
                >
                    {room.title}
                </div>
            ))}
        </div>
    )
}

export default ChatList;