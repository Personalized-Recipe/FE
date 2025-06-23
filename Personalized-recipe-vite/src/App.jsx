import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Main from "./pages/Main/Main";
import Home from "./pages/Home/Home";
import MyIngre from "./pages/Main/MyIngre/MyIngre";
import MyPage from "./pages/Main/MyPage/MyPage";
import MyRecipe from "./pages/Main/MyRecipe/MyRecipe";
import Logout from "./pages/Main/Logout/Logout";
import ModalWrapper from "./components/ModalWrapper/ModalWrapper";
import OauthCallback from "./pages/Home/Login/OauthCallback"; // 이미 import 되어 있음
import New from  "./components/NewUser/NewUser";
import "./App.scss";



function App() {
  const location = useLocation();
  const background = location.state?.background;
  const [isEdited, setIsEdited] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleModalClose = () => {
    console.log("App: handleModalClose 호출, isEdited =", isEdited);
    if (isEdited) {
      setShowAlert(true);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="App"> 
      <Routes location={background || location}>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/new" element={<New />} />
          <Route path="/oauth/callback/:provider" element={<OauthCallback />} /> {/* 이 줄 추가 */}
      </Routes>

      {/* 모달 오버레이 조건 */}
      {background && (
        <Routes>
          <Route path="/MyIngre" element={
            <ModalWrapper handleClose={handleModalClose}>
              <MyIngre  
                onClose={handleModalClose} 
                setIsEdited={setIsEdited}
                showAlert={showAlert}
                setShowAlert={setShowAlert}
                />
              </ModalWrapper>
          } />
          <Route path="/MyPage" element={
            <ModalWrapper handleClose={handleModalClose}>
              <MyPage
                onClose={handleModalClose} 
                setIsEdited={setIsEdited}
                showAlert={showAlert}
                setShowAlert={setShowAlert}
                />
              </ModalWrapper>
          } />
          <Route path="/MyRecipe" element={
            <ModalWrapper handleClose={handleModalClose}>
              <MyRecipe 
                onClose={handleModalClose} 
                setIsEdited={setIsEdited}
                showAlert={showAlert}
                setShowAlert={setShowAlert}
              />
            </ModalWrapper>
          } />
          <Route path="/Logout" element={
            <ModalWrapper handleClose={handleModalClose}>
              <Logout
                  onClose={handleModalClose} 
                  setIsEdited={setIsEdited}
                  showAlert={showAlert}
                  setShowAlert={setShowAlert}
                 />
                </ModalWrapper>
          } />
        </Routes>
      )}
      
    </div>
  );
}

export default App;
