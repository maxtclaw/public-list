import { push } from 'firebase/database'
import { useState } from 'react';

export default function DisplayCreateList({ dbRef, setListKey }) {
    
    // Controlled input for list user ✅
    const [userInput, setUserInput] = useState(`Anonymous`)
    const handleUserChange = function (e) {
        setUserInput(e.target.value);
    }

    // Controlled input for list title ✅
    const [titleInput, setTitleInput] = useState(`Anonymous's List`)
    const handleTitleChange = function (e) {
        setTitleInput(e.target.value);
    }
    

    // Create and push a new list to Firebase ✅
    const handleSubmitList = function (e) {
        e.preventDefault();

        // Helper function to make 1-digit months and days two digits (e.g. January => 0 => 01)
        const twoDigits = (num) => { return (num < 10 ? '0' : '') + num };

        const currentDate = new Date();
        const currentTime = currentDate.getFullYear().toString()
            + twoDigits(currentDate.getMonth() + 1)
            + twoDigits(currentDate.getDate())
            + currentDate.getHours()
            + currentDate.getMinutes()
            + currentDate.getSeconds()
            + currentDate.getMilliseconds();

        const firebaseObj = push(dbRef, {
            user: userInput,
            title: titleInput,
            time: currentTime,
            listItems: {}
        });

        // Update the current list key for display
        setListKey(firebaseObj.key);
    }



    return (
        <form onSubmit={handleSubmitList}>
            <label htmlFor="listTitle">List Title</label>
            <input type="text" id="title" onChange={handleTitleChange} value={titleInput} required />

            <label htmlFor="user">List Author: </label>
            <input type="text" id="user" onChange={handleUserChange} value={userInput} required />

            <button type="submit">Make my list!</button>
        </form>
    );
}