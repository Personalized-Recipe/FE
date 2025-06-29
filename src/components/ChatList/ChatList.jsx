import React,{ useState } from "react";
import styles from './ChatList.module.scss';

function ChatList({ chatRooms, onSelectChat, onUpdateTitle, onDeleteChatRoom, currentRoomId }) {
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

    const handleDelete = (e, roomId) => {
        e.stopPropagation(); // 클릭 이벤트 전파 방지
        if (window.confirm('정말로 이 채팅방을 삭제하시겠습니까?')) {
            onDeleteChatRoom(roomId);
        }
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
                                handleRoomClick(room);
                                if (room.id === currentRoomId) handleEdit(room.id); // 선택된 방만 편집 모드
                              } }>
                            {room.title || "새 채팅방"}
                        </span>
                    )}
                    <button 
                        className={styles.deleteButton}
                        onClick={(e) => handleDelete(e, room.id)}
                        title="채팅방 삭제"
                    >
                        🗑️
                    </button>
                </div>
            ))}
        </div>
    )
}

export default ChatList;