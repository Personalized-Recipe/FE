import React, { useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/Chatwindow/Chatwindow";

function Home() {
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
        <div className={styles.home}>
            <Navbar />
            <div className={styles.home__content}>
                <Sidebar showIngredient={showIngredient} ingredients={ingredients} />
                <div className={styles.home__chat}>
                    <ChatWindow handleIngredientClick={handleIngredientClick} />    
                </div>
            </div>
        
        </div>
    )
}

export default Home;