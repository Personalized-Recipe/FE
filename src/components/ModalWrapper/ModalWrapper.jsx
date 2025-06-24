import React from "react";  
import ReactDOM from "react-dom";
import styles from "./ModalWrapper.module.scss";

function ModalWrapper({ children, handleClose }) {

    return ReactDOM.createPortal (
        <div className={styles.Overlay}>
            <div className={styles.Modal} onClick={e => e.stopPropagation()}>
                 <button className={styles.modalClose} onClick={() => {
                    handleClose();
                    console.log("모달 닫기 버튼 클릭")
                 }}>닫기</button>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root")
    );
}

export default ModalWrapper;