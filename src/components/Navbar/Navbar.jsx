import React, { useState } from 'react';
import './Navbar.scss';

function Navbar({ onClickLogin }) {


  return (
    
    <div className="Navbar">
        <img src="/logo.png" alt="Logo" className='logo'/>
        <button className="sign_up" onClick={onClickLogin}>간편 로그인</button>
        <div className="login_nav">
            <div className="help"></div>
            <button className="my_recipe"></button>
            <button className="my_ingre"></button>
            <button className="profile"></button>
            <button className="logout"></button>
        </div>
    </div>
  );     
}

export default Navbar;