import { useState, useEffect } from 'react';
import axios from 'axios';
import { isLoggedIn, getAuthInfo, requireAuth } from "./auth.js";

export const useIngre = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);

    // 초기 재료 목록 로드
    const loadIngredients = async () => {
        try {
            if (!requireAuth()) {
                console.log("로그인 상태가 아닙니다. 로컬 스토리지에서 로드합니다.");
                const stored = localStorage.getItem("MyIngre");
                const parsed = JSON.parse(stored) || [];
                
                // 로컬 스토리지 데이터도 필드명 매핑 적용
                const mappedStoredIngredients = parsed.map(item => ({
                    id: item.ingredientId || item.id,
                    name: item.name || item.ingredientName, // name 또는 ingredientName 사용
                    amount: item.amount,
                    unit: item.unit,
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                
                setIngredients(mappedStoredIngredients);
                return;
            }
            
            const authInfo = getAuthInfo();
            if (!authInfo) {
                console.log("인증 정보가 없습니다. 로컬 스토리지에서 로드합니다.");
                const stored = localStorage.getItem("MyIngre");
                const parsed = JSON.parse(stored) || [];
                
                // 로컬 스토리지 데이터도 필드명 매핑 적용
                const mappedStoredIngredients = parsed.map(item => ({
                    id: item.ingredientId || item.id,
                    name: item.name || item.ingredientName, // name 또는 ingredientName 사용
                    amount: item.amount,
                    unit: item.unit,
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                
                setIngredients(mappedStoredIngredients);
                return;
            }
            
            const { token, userId } = authInfo;
            
            if (!token || !userId) {
                console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
                const stored = localStorage.getItem("MyIngre");
                const parsed = JSON.parse(stored) || [];
                
                // 로컬 스토리지 데이터도 필드명 매핑 적용
                const mappedStoredIngredients = parsed.map(item => ({
                    id: item.ingredientId || item.id,
                    name: item.name || item.ingredientName, // name 또는 ingredientName 사용
                    amount: item.amount,
                    unit: item.unit,
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                
                setIngredients(mappedStoredIngredients);
                return;
            }

            console.log("데이터베이스에서 재료 목록을 로드합니다. userId:", userId);
            setLoading(true);

            const response = await axios.get(`/api/ingredients/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // 백엔드에서 배열을 직접 반환하므로 response.data가 바로 재료 목록
            if (response.data && Array.isArray(response.data)) {
                console.log("데이터베이스에서 재료 로드 성공:", response.data.length, "개");
                console.log("백엔드 응답 원본 데이터:", response.data); // 디버깅용
                
                // 백엔드 필드명을 프론트엔드 필드명으로 매핑
                const mappedIngredients = response.data.map(item => {
                    console.log("개별 재료 데이터:", item); // 디버깅용
                    return {
                        id: item.ingredientId || item.id, // ingredientId 또는 id
                        name: item.ingredientName || item.name, // ingredientName -> name
                        amount: item.amount,
                        unit: item.unit,
                        createdAt: item.createdAt || new Date().toISOString()
                    };
                });
                
                console.log("매핑된 재료 데이터:", mappedIngredients); // 디버깅용
                setIngredients(mappedIngredients);
                // 로컬 스토리지도 업데이트
                localStorage.setItem("MyIngre", JSON.stringify(mappedIngredients));
            } else {
                console.log("데이터베이스 응답에 재료 목록이 없습니다.");
                const stored = localStorage.getItem("MyIngre");
                const parsed = JSON.parse(stored) || [];
                
                // 로컬 스토리지 데이터도 필드명 매핑 적용
                const mappedStoredIngredients = parsed.map(item => ({
                    id: item.ingredientId || item.id,
                    name: item.name || item.ingredientName, // name 또는 ingredientName 사용
                    amount: item.amount,
                    unit: item.unit,
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                
                setIngredients(mappedStoredIngredients);
            }
        } catch (error) {
            console.error("재료 목록 로드 실패:", error);
            // API 실패 시 로컬 스토리지에서 로드
            const stored = localStorage.getItem("MyIngre");
            const parsed = JSON.parse(stored) || [];
            
            // 로컬 스토리지 데이터도 필드명 매핑 적용
            const mappedStoredIngredients = parsed.map(item => ({
                id: item.ingredientId || item.id,
                name: item.name || item.ingredientName, // name 또는 ingredientName 사용
                amount: item.amount,
                unit: item.unit,
                createdAt: item.createdAt || new Date().toISOString()
            }));
            
            setIngredients(mappedStoredIngredients);
        } finally {
            setLoading(false);
        }
    };

    // 재료 추가
    const addIngredientToDB = async (ingredient) => {
        try {
            if (!requireAuth()) {
                return false;
            }
            
            const authInfo = getAuthInfo();
            if (!authInfo) {
                return false;
            }
            
            const { token, userId } = authInfo;
            
            if (!token || !userId) {
                console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
                return false;
            }

            setLoading(true);

            const response = await axios.post(`/api/ingredients/user/${userId}`, {
                ingredientName: ingredient.name || ingredient.ingredientName,
                amount: ingredient.amount,
                unit: ingredient.unit
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // 백엔드에서 성공 시 재료 객체를 반환하므로 response.data가 있으면 성공
            if (response.data) {
                console.log("재료 추가 성공:", response.data);
                // 성공 시 재료 목록 다시 로드
                await loadIngredients();
                return true;
            }
            return false;
        } catch (error) {
            console.error("재료 추가 실패:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 재료 수정
    const updateIngredientInDB = async (ingredientId, ingredient) => {
        try {
            if (!requireAuth()) {
                return false;
            }
            
            const authInfo = getAuthInfo();
            if (!authInfo) {
                return false;
            }
            
            const { token, userId } = authInfo;
            
            if (!token || !userId) {
                console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
                return false;
            }

            setLoading(true);

            // 복합키 구조: PUT /api/ingredients/{userId}/{ingredientId}
            const response = await axios.put(`/api/ingredients/${userId}/${ingredientId}`, {
                ingredientName: ingredient.name, // ingredientName으로 전송
                amount: ingredient.amount,
                unit: ingredient.unit
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // 백엔드에서 성공 시 재료 객체를 반환하므로 response.data가 있으면 성공
            if (response.data) {
                console.log("재료 수정 성공:", response.data);
                // 성공 시 재료 목록 다시 로드
                await loadIngredients();
                return true;
            }
            return false;
        } catch (error) {
            console.error("재료 수정 실패:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 재료 삭제
    const deleteIngredientFromDB = async (ingredientId) => {
        try {
            if (!requireAuth()) {
                return false;
            }
            
            const authInfo = getAuthInfo();
            if (!authInfo) {
                return false;
            }
            
            const { token, userId } = authInfo;
            
            if (!token || !userId) {
                console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
                return false;
            }

            setLoading(true);

            // DELETE /api/ingredients/{userId}/{ingredientId}
            const response = await axios.delete(`/api/ingredients/${userId}/${ingredientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // 백엔드에서 성공 시 메시지를 반환하므로 response.data가 있으면 성공
            if (response.data) {
                console.log("재료 삭제 성공:", response.data);
                // 성공 시 재료 목록 다시 로드
                await loadIngredients();
                return true;
            }
            return false;
        } catch (error) {
            console.error("재료 삭제 실패:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleIngredient = () => {
        loadIngredients();
    };

    // 기존 로컬 데이터를 데이터베이스와 동기화
    const syncLocalDataWithDB = async () => {
        try {
            if (!requireAuth()) {
                console.log("로그인 상태가 아니므로 동기화를 건너뜁니다.");
                return;
            }
            
            const authInfo = getAuthInfo();
            if (!authInfo) {
                console.log("인증 정보가 없으므로 동기화를 건너뜁니다.");
                return;
            }
            
            const { token, userId } = authInfo;
            
            if (!token || !userId) {
                console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
                return;
            }

            console.log("로컬 데이터와 데이터베이스 동기화를 시작합니다.");
            
            // 로컬 스토리지에서 ID가 없는 재료들을 찾기
            const stored = localStorage.getItem("MyIngre");
            const localIngredients = JSON.parse(stored) || [];
            const unsyncedIngredients = localIngredients.filter(item => !item.id);
            
            if (unsyncedIngredients.length === 0) {
                console.log("동기화할 로컬 데이터가 없습니다.");
                return;
            }
            
            console.log(`${unsyncedIngredients.length}개의 로컬 재료를 데이터베이스에 동기화합니다.`);
            
            // 각 재료를 데이터베이스에 추가
            for (const ingredient of unsyncedIngredients) {
                try {
                    const response = await axios.post(`/api/ingredients/user/${userId}`, {
                        ingredientName: ingredient.name || ingredient.ingredientName,
                        amount: ingredient.amount,
                        unit: ingredient.unit
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.data) {
                        console.log(`재료 "${ingredient.name || ingredient.ingredientName}" 동기화 성공`);
                    }
                } catch (error) {
                    console.error(`재료 "${ingredient.name || ingredient.ingredientName}" 동기화 실패:`, error);
                }
            }
            
            // 동기화 후 재료 목록 다시 로드
            await loadIngredients();
            console.log("동기화 완료");
            
        } catch (error) {
            console.error("데이터 동기화 실패:", error);
        }
    };

    // 컴포넌트 마운트 시 재료 목록 로드
    useEffect(() => {
        loadIngredients();
    }, []);

    return {
        ingredients,
        setIngredients,
        handleIngredient,
        addIngredientToDB,
        updateIngredientInDB,
        deleteIngredientFromDB,
        syncLocalDataWithDB,
        loading
    };
}; 