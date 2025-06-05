import React, { useEffect, useRef, useState } from "react";
import styles from "./MyIngre.module.scss";
import { sortByCreatedAt } from "../../../utils/sort";

function MyIngre() {
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [tempName, setTempName] = useState("");
  const [ingredients, setIngredients] = useState([]);

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
      // 초기 데이터는 최신순으로 정렬
      const sorted = sortByCreatedAt(migrated, "recent");
      setIngredients(sorted)
      localStorage.setItem("MyIngre", JSON.stringify(sorted));
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAdd = () => {
    if (!input.trim()) return;

    setTempName(input);
    setInput("");
    setTimeout(() => {
      if (amountRef.current) {
        amountRef.current.focus();
      }
    }, 0);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    if (e.target.value && searchBtnRef.current) {
      searchBtnRef.current.focus();
    }
  }

  const handleConfirm = () => {
    if (! tempName || !amount || !unit) return;

    const newItem = { name: tempName, amount, unit, createdAt: new Date().toISOString(), };
    const updated = [...ingredients, newItem];
    setIngredients(updated);
    localStorage.setItem("MyIngre", JSON.stringify(updated));

    setTempName("");
    setAmount("");
    setUnit("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
    <div className={styles.container}>
      <h2>장바구니</h2>
      <div className={styles.inputContainer}>
        <input
          className= {styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="재료 입력"
        />
        <button className={styles.searchButton} onClick={handleAdd}>검색</button>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.itemContainer}>
          {ingredients.map((item, idx) => (
            <div className={styles.Item} key={idx}>
              {item.name} - {item.amount} {item.unit}
            </div>
          ))}
        </div>
        <div className={styles.ingreInfo}>
          재료 정보를 입력해주세요
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
          <button className={styles.addButton} onClick={handleConfirm}>추가하기</button>
        </div>
      </div>
    </div>
  );
}

export default MyIngre;
