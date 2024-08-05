'use client';

import { useState } from 'react';

export default function LikeButton() {
    // First item in array is value that we will update, second one is set function to update that value and 0 represents initial value 
    const [likes, setLikes] = useState(0);

    function handleClick() {
        setLikes(likes + 1);
    }

    return (
        <>
            <button onClick={handleClick}>Like</button>
            <div>Total Likes: {likes}</div>
        </>
    );
}