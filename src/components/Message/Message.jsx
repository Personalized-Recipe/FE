import React from 'react';
import styles from "./Message.module.scss";

function Message({ role, content }) {
    return (
        <div className={`${styles.message} ${role === 'user' ? styles.user : styles.bot}`}>
            <div className={styles.message__content}>
                {content}
            </div>
        </div>
    );
}

export default Message;