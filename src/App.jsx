import React, { useState } from 'react';
import './App.scss';
import Navbar from './components/Navbar/Navbar.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Home/Login/Login.jsx';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  }
  const handleCloseLogin = () => {
    setShowLogin(false);
  }

  return (
    <div className="App">
      <Navbar onClickLogin={handleLoginClick} />
      <Home />
      {showLogin && <Login onClose={handleCloseLogin}/>}
    </div>
  );     
}

export default App;