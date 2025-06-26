import React from 'react';
import styles from "./Message.module.scss";

function Message({ role, content }) {
    // 줄바꿈을 <br> 태그로 변환
    const formatContent = (text) => {
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className={`${styles.message}`}>
            <div className={`${styles.message__content} ${role === 'user' ? styles.user : styles.bot}`}>
                {formatContent(content)}
            </div>
        </div>
    );
}

export default Message;