import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Main from "./pages/Main/Main";
import Home from "./pages/Home/Home";
import MyIngre from "./pages/Main/MyIngre/MyIngre";
import MyPage from "./pages/Main/MyPage/MyPage";
import Recipe from "./pages/Main/Recipe/Recipe";
import Logout from "./pages/Main/Logout/Logout";
import ModalWrapper from "./components/ModalWrapper/ModalWrapper";
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


  console.log("background:", background);
  console.log("location.pathname:", location.pathname);

  return (
    <div className="App"> 
      <Routes location={background || location}>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
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
          <Route path="/Recipe" element={
            <ModalWrapper handleClose={handleModalClose}>
              <Recipe 
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
