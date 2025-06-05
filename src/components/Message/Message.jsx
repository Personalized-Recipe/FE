import React from 'react';
import styles from "./Message.module.scss";

function Message({ role, content }) {
    return (
        <div className={`${styles.message}`}>
            <div className={`${styles.message__content} ${role === 'user' ? styles.user : styles.bot}`}>
                {content}
            </div>
        </div>
    );
}

export default Message;