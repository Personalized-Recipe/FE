import React from "react";
import styles from './ChatList.module.scss';

function ChatList({chatRooms, onSelectChat}) {
    
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