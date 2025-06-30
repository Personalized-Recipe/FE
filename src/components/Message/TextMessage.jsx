import React from "react";
import styles from "./Message.module.scss";

 // 줄바꿈을 <br> 태그로 변환
function TextMessage({ role, content }) {
    const formatContent = (text) => {
        // text가 undefined, null, 또는 빈 문자열인 경우 처리
        if (!text || typeof text !== 'string') return <span>메시지 내용이 없습니다.</span>;
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className={styles.message}>
            <div className={`${styles.message__content} ${role === 'user' ? styles.user : styles.bot}`}>
                {formatContent(content)}
            </div>
        </div>
    );
}

export default TextMessage;