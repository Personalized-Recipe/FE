import React, { useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/Chatwindow/Chatwindow";

function Main() {
    const [ingredients, setIngredients] = useState([]);
    const [showIngredient, setShowIngredient] = useState(false);

    const handleIngredientClick = () => {
        const stored = localStorage.getItem("MyIngre");
        console.log(stored);

        if (!showIngredient) {
            const parsed = JSON.parse(stored) || [];
            setIngredients(parsed);
        }
        setShowIngredient(prev => !prev);
    }

    console.log(" 현재 재료 목록:", ingredients);
    console.log(" showIngredient:", showIngredient);

    return (
        <div className={styles.main}>
            <Navbar />
            <div className={styles.main__content}>
                <Sidebar showIngredient={showIngredient} ingredients={ingredients} />
                <div className={styles.main__chat}>
                    <ChatWindow handleIngredientClick={handleIngredientClick} />    
                </div>
            </div>
        
        </div>
    )
}

export default Main;