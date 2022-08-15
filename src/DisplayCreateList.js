import { push } from 'firebase/database'
import { useEffect, useState } from 'react';

export default function DisplayCreateList({ dbRef, userKey, setListKey }) {
    
    // Controlled input for list user ✅
    const [authorInput, setAuthorInput] = useState('Anonymous User')
    const handleAuthorChange = function (e) {
        setAuthorInput(e.target.value);
    }

    // Controlled input for list title ✅
    const [titleInput, setTitleInput] = useState(`Anonymous User's List`)
    const handleTitleChange = function (e) {
        setTitleInput(e.target.value);
    }

    // Controlled input for list hidden ✅
    const [hiddenInput, setHiddenInput] = useState(false);
    const handleHiddenInput = function () {
        setHiddenInput(!hiddenInput);
    }

    // Selects all text inside textbox ✅
    const selectAllText = function (e) {
        e.target.select()
    }

    // useEffect to reset hiddenInput if changing to Anonymous User ✅
    useEffect(() => {
        if (userKey === 'Anonymous User') {
            setHiddenInput(false);
        }

        setAuthorInput(userKey)
        setTitleInput(`${userKey}'s List`)

    }, [userKey])

    // Create and push a new list to Firebase ✅
    const handleSubmitList = function (e) {
        e.preventDefault();

        // Helper functions appending leading zeros to two or three digits
        const twoDigits = (num) => { return (num < 10 ? '0' : '') + num };
        const threeDigits = (num) => { return (num < 10 ? '00' : (num < 100 ? '0' : '')) + num };

        // Store current local time as a string in YYYYMMDDhhmmsslll format
        const currentDate = new Date();
        const currentTime = currentDate.getFullYear().toString()
            + twoDigits(currentDate.getMonth() + 1)
            + twoDigits(currentDate.getDate())
            + twoDigits(currentDate.getHours())
            + twoDigits(currentDate.getMinutes())
            + twoDigits(currentDate.getSeconds())
            + threeDigits(currentDate.getMilliseconds());

        const firebaseObj = push(dbRef, {
            user: userKey,
            author: authorInput,
            title: titleInput,
            hidden: hiddenInput,
            time: currentTime,
            listItems: {}
        });

        // Update the current list key for display
        setListKey(firebaseObj.key);
    }


    return (
        <form onSubmit={handleSubmitList}>
            <div onClick={selectAllText}>
                <label htmlFor="newTitle">List Title: </label>
                <input type="text" id="newTitle" onChange={handleTitleChange} value={titleInput} placeholder='e.g. My Necessities' required />
            </div>

            <div onClick={selectAllText} >
                <label htmlFor="newAuthor">List Author: </label>
                <input type="text" id="newAuthor" onChange={handleAuthorChange} value={authorInput} placeholder='e.g. Needy Sapling' required />
            </div>

            {
                // Allow hidden option if a user has been provided
                userKey !== 'Anonymous User' ? <>
                    <input type="checkbox" id="newHidden" checked={hiddenInput} onChange={handleHiddenInput} />
                    <label htmlFor="newHidden"> Make List Private </label>
                </> : null

            }

            <button type="submit">Make my list!</button>

        </form>
    );
}