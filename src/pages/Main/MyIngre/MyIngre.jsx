import React, { useEffect, useRef, useState } from "react";
import styles from "./MyIngre.module.scss";
import useList from "../../../utils/useList";

function MyIngre() {
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [tempName, setTempName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [ingredients, addIngredient, updateIngredient, removeIngredient, ] = useList([], ['name', 'amount', 'unit']);

  const inputRef = useRef(null);
  const amountRef = useRef(null);
  const unitRef = useRef(null);
  const searchBtnRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("MyIngre");
    if (saved) {
      const parsed = JSON.parse(saved);
      // createdAt이 없는 경우 현재 시간으로 채우기
      const migrated = parsed.map(item => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      migrated.forEach(item => addIngredient(item));
    } 
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("MyIngre", JSON.stringify(ingredients));
  }, [ingredients]);

  // 재료 입력
  const handleAdd = () => {
    if (!input.trim()) return;

    setTempName(input);
    setInput("");
    setTimeout(amountRef.current?.focus(), 0);
  };

  // 재료 삭제
  const handleDelete = (index) => {
    removeIngredient(index);
  };

  // 재료 단위 변경
  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    if (e.target.value && searchBtnRef.current) {
      searchBtnRef.current.focus();
    }
  }

  // 재료 추가
  const handleConfirm = () => {
    if (! tempName || !amount || !unit) return;

    const newItem = { name: tempName, amount, unit, createdAt: new Date().toISOString() };

    if (editingIndex !== null) {
      // 수정 모드
      const updated = ingredients[editingIndex];
      updateIngredient(editingIndex, { ...newItem, createdAt: updated.createdAt });
      setEditingIndex(null);
    } else {
      // 추가 모드
      const added = addIngredient(newItem);
      if (!added) {
        alert("이미 등록한 재료입니다.");
        return;
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
    setTempName(item.name);
    setAmount(item.amount);
    setUnit(item.unit);
    setEditingIndex(index);
  }

  return (
    <div className={styles.container}>
      <h2>장바구니</h2>
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
              {item.name} {item.amount}{item.unit}
              <button className={styles.deleteBtn} onClick={(e) => {
                e.stopPropagation(); // 클릭 방지
                handleDelete(idx);
              }}>삭제</button>
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
          <button className={styles.addButton} onClick={handleConfirm}>
            {editingIndex !== null ? "수정하기" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyIngre;
