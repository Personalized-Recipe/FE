import { useState } from "react";

function useList(initial = [], compareKeys = null) {
    const [list, setList] = useState(initial);

    const isEqual = (a, b) => {
        if (compareKeys === null) {
            // 기본 전체 객체 비교 (fallback)
            return JSON.stringify(a) === JSON.stringify(b);
        }
        return compareKeys.every(key => a[key] === b[key]);
    };

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

    const updateItem = (index, value) => {
        setList(list.map((item, i) => i === index ? value : item));
    };

    const removeItem = (index) => {
        setList(list.filter((_, i) => i !== index ));
    };

    const clear = () => {
        setList([]);
    };
    
    return [list, addItem, updateItem, removeItem, clear, setList];
}

export default useList;