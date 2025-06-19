import { useState } from "react";

function isEqual(a, b) {
    return JSON.stringify(a, Object.keys(a).sort()) === JSON.stringify(b, Object.keys(b).sort());
}

function useList(initial = []) {
    const [list, setList] = useState(initial);

    const addItem = (value) => {
        // null/undefined 방어
        if (value === null || value === undefined) return false;
        
        // 문자열이면 trim 검사
        if (typeof value === 'string') {
            if(!value.trim()) return false;
        }
        // 중복 여부 검사
        if(list.some(item => isEqual(item, value))) return false;

        setList([...list, value]);
        return true;
    };

    const removeItem = (index) => {
        setList(list.filter((_, i) => i !== index ));
    };

    const clear = () => {
        setList([]);
    };
    
    return [list, addItem, removeItem, clear];
};

export default useList;