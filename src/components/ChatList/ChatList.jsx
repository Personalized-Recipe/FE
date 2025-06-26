import React,{ useState } from "react";
import styles from './ChatList.module.scss';

function ChatList({ chatRooms, onSelectChat, onUpdateTitle, currentRoomId }) {
    const [editingRooms, setEditingRooms] = useState({});

    const handleEdit = (roomId) => {
        setEditingRooms(prev => ({ ...prev, [roomId]: true }));
    };

    const handleBlur = (roomId) => {
        setEditingRooms(prev => ({ ...prev, [roomId]: false }));
    };

      const handleChange = (e, room) => {
        onUpdateTitle(room.id, e.target.value);
    }

    const handleRoomClick = (room) => {
        onSelectChat(room);
    }

    return(
        <div className={styles.chatList}>
            {chatRooms?.map(room => (
                <div
                    key={room.id}
                    className={
                        room.id === currentRoomId
                            ? `${styles.room} ${styles.selectedRoom}`
                            : styles.room
                    }
                    onClick={() => handleRoomClick(room)}
                >
                    {editingRooms[room.id] && room.id === currentRoomId ? (
                        <input 
                            type="text" 
                            value={room.title}  
                            onBlur={() => handleBlur(room.id)}
                            onChange={(e) => handleChange(e, room)} 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleBlur(room.id);
                                }
                            }}
                            autoFocus
                            className={styles.room__titleInput}
                        />
                    ) : (
                        <span className={styles.chatWindow__title} 
                              onClick={(e) => {
                                e.stopPropagation(); // 클릭 이벤트 전파 방지
                                if (room.id === currentRoomId) handleEdit(room.id); // 선택된 방만 편집 모드
                              } }>
                            {room.title || "새 채팅방"}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ChatList;