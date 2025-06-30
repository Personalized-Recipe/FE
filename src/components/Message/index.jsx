import React from 'react';
import TextMessage from './TextMessage';
import RecipeListMessage from './RecipeListMessage';
import RecipeDetailMessage from './RecipeDetailMessage';

function Message(props) {
    const { type } = props;
    
    if (type === 'recipe-list') return <RecipeListMessage {...props} />;
    if (type === 'recipe-detail') return <RecipeDetailMessage {...props} />;
    return <TextMessage {...props} />;
}

export default Message;