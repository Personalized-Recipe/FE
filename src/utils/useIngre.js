import { useState } from 'react';

export const useIngre = () => {
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
    };

    console.log(" 현재 재료 목록:", ingredients);
    console.log(" showIngredient:", showIngredient);

    return {
        ingredients,
        showIngredient,
        handleIngredientClick
    };
}