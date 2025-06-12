export function createChatRoom(chatRooms) {
    const newRoom = {
        id: Date.now().toString(),
        title: `새 채팅방 ${chatRooms.length + 1}`,
        messages: [],
        createdAt: new Date().toISOString()
    };
    const updatedRooms = [newRoom, ...chatRooms];
    localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));
    return { newRoom, updatedRooms };
}