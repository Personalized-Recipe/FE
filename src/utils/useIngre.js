import { useState } from 'react';

export const useIngre = () => {
    const [ingredients, setIngredients] = useState([]);

    const handleIngredient = () => {
        const stored = localStorage.getItem("MyIngre");
        const parsed = JSON.parse(stored) || [];
        setIngredients(parsed);
    };

    return {
        ingredients,
        setIngredients,
        handleIngredient
    };
}