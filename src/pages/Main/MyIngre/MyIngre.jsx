import React, { useEffect, useRef, useState } from "react";
import styles from "./MyIngre.module.scss";
import useList from "../../../utils/useList";
import { useIngre } from "../../../utils/useIngre";

// 초기값 로드 함수 (로컬 스토리지 폴백용)
const loadInitialIngredients = () => {
  const saved = localStorage.getItem("MyIngre");
  if (!saved) return [];
    // createdAt이 없는 경우 현재 시간으로 채우기
    return JSON.parse(saved).map(item => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString()
    }));
}

function MyIngre() {
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [tempName, setTempName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  
  // 데이터베이스 API 훅 사용
  const { ingredients, addIngredientToDB, updateIngredientInDB, deleteIngredientFromDB, loading } = useIngre();

  const inputRef = useRef(null);
  const amountRef = useRef(null);
  const unitRef = useRef(null);
  const searchBtnRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 재료 입력
  const handleAdd = () => {
    if (!input.trim()) return;

    setTempName(input);
    setInput("");
    setTimeout(amountRef.current?.focus(), 0);
  };

  // 재료 삭제
  const handleDelete = async (index) => {
    const item = ingredients[index];
    console.log("삭제할 재료:", item); // 디버깅용
    
    // 데이터베이스에서 삭제 시도
    if (item.id) {
      const success = await deleteIngredientFromDB(item.id);
      if (success) {
        console.log("데이터베이스에서 재료 삭제 성공");
      } else {
        console.log("데이터베이스에서 재료 삭제 실패, 로컬에서만 삭제");
      }
    } else {
      console.log("재료 ID가 없어서 로컬에서만 삭제합니다.");
    }
    
    // 로컬에서도 삭제 (임시로 배열에서 제거)
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    localStorage.setItem("MyIngre", JSON.stringify(updatedIngredients));
  };

  // 재료 단위 변경
  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    if (e.target.value && searchBtnRef.current) {
      searchBtnRef.current.focus();
    }
  }

  // 재료 추가
  const handleConfirm = async () => {
    if (! tempName || !amount || !unit) return;

    const newItem = { name: tempName, amount, unit, createdAt: new Date().toISOString() };

    if (editingIndex !== null) {
      // 수정 모드
      const updated = ingredients[editingIndex];
      console.log("수정할 기존 재료:", updated); // 디버깅용
      const updatedItem = { ...newItem, createdAt: updated.createdAt };
      
      // 데이터베이스에서 수정 시도
      if (updated.id) {
        const success = await updateIngredientInDB(updated.id, updatedItem);
        if (success) {
          console.log("데이터베이스에서 재료 수정 성공");
        } else {
          console.log("데이터베이스에서 재료 수정 실패, 로컬에서만 수정");
        }
      } else {
        console.log("재료 ID가 없어서 로컬에서만 수정합니다.");
      }
      
      // 로컬에서도 수정 (임시로 배열 업데이트)
      const updatedIngredients = [...ingredients];
      updatedIngredients[editingIndex] = updatedItem;
      localStorage.setItem("MyIngre", JSON.stringify(updatedIngredients));
      setEditingIndex(null);
    } else {
      // 추가 모드
      // 데이터베이스에 추가 시도
      const success = await addIngredientToDB(newItem);
      if (success) {
        console.log("데이터베이스에 재료 추가 성공");
        // 성공 시 로컬 상태는 useIngre 훅에서 자동으로 업데이트됨
      } else {
        console.log("데이터베이스에 재료 추가 실패, 로컬에서만 추가");
        // 실패 시 로컬에서만 추가
        const updatedIngredients = [...ingredients, newItem];
        localStorage.setItem("MyIngre", JSON.stringify(updatedIngredients));
      }
    }

    // 입력 초기화
    setTempName("");
    setAmount("");
    setUnit("");
    inputRef.current?.focus();
  }

  // 재료 수정 
  const handleEdit = (index) => {
    const item = ingredients[index];
    console.log("수정할 재료:", item); // 디버깅용
    
    // name 필드가 없을 경우 ingredientName 필드도 확인
    const itemName = item.name || item.ingredientName || "";
    
    setTempName(itemName);
    setAmount(item.amount || "");
    setUnit(item.unit || "");
    setEditingIndex(index);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🥕 장바구니 🥕</h2>
      {loading && <div className={styles.loading}>저장 중...</div>}
      <div className={styles.inputContainer}>
        <input
          className= {styles.input}
          value={input}
          onFocus={() => {
            setEditingIndex(null) // 포커스 시 수정 모드 해제
            setTempName(""); // 입력 필드 초기화
            setAmount(""); // 양 초기화
            setUnit(""); // 단위 초기화
          }} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="재료 입력"
          ref={inputRef}
        />
        <button className={styles.searchButton} onClick={handleAdd}>입력</button>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.itemContainer}>
          {ingredients.map((item, idx) => (
            <div className={styles.Item} key={idx} onClick={() => handleEdit(idx)}>
              {item.name || item.ingredientName || "이름 없음"} {item.amount}{item.unit}
              {editingIndex === idx && (
                <button className={styles.deleteBtn} onClick={(e) => {
                  e.stopPropagation(); // 클릭 방지
                  handleDelete(idx);
                }}>삭제</button>
              )}
            </div>
          ))}
        </div>
        <div className={styles.ingreInfo}>
          <div className={styles.editNotice}>
            {editingIndex !== null && `수정 중인 항목: ${tempName}`}
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.ingreName}>{tempName}</div>
            <input 
              className={styles.ingreAmount}
              type="number"
              value={amount}
              ref={amountRef}
              onChange={e => {
                setAmount(e.target.value)
                if (e.target.value && unitRef.current) {
                  unitRef.current.focus();
                }
                }}
              placeholder="양(숫자)"
            />
            <select 
              className={styles.ingreUnit}
              value={unit}
              onChange={handleUnitChange}
            >
              <option value="">단위 선택</option>
              <option value="g">g</option>
              <option value="개">개</option>
              <option value="ml">ml</option>
            </select>
          </div>
          <button className={styles.addButton} onClick={handleConfirm} disabled={loading}>
            {loading ? "저장 중..." : (editingIndex !== null ? "수정하기" : "추가하기")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyIngre;
