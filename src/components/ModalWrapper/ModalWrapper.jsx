import React from "react";  
import ReactDOM from "react-dom";
import styles from "./ModalWrapper.module.scss";
import { AiOutlineClose } from "react-icons/ai";

function ModalWrapper({ children, handleClose }) {
    const isLogout = children?.type?.name === 'Logout';
    return ReactDOM.createPortal (
        <div className={styles.Overlay}>
            <div className={styles.Modal} onClick={e => e.stopPropagation()}>
                {!isLogout && (
                  <button className={styles.modalClose} onClick={() => {
                      handleClose();
                      console.log("모달 닫기 버튼 클릭")
                  }} aria-label="닫기">
                    <AiOutlineClose size={22} />
                  </button>
                )}
                {children}
            </div>
        </div>,
        document.getElementById("modal-root")
    );
}

export default ModalWrapper;