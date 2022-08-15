import { useEffect, useState } from "react";

export default function DisplayUserLogin({ userKey, setUserKey }) {
    
    // State to check how to display user ✅
    const [isEditingUser, setIsEditingUser] = useState(false);
    const handleSetIsEditingUser = function (e) {
        e.preventDefault();
        setIsEditingUser(true);
    }

    // Controlled input for list user ✅
    const [userInput, setUserInput] = useState(userKey)
    const handleUserChange = function (e) {
        setUserInput(e.target.value);
    }

    // Handle setting user key ✅
    const handleSubmitUser = function (e) {
        e.preventDefault();

        setIsEditingUser(false)

        // Remove focus after submitting
        const userInputTextboxElement = document.getElementById('user');
        userInputTextboxElement.blur();
        
        // Update userKey if there is an input, otherwise, use the default 'Anonymous User'
        if (userInput) {
            setUserKey(userInput);
        } else {
            setUserKey('Anonymous User');
            setUserInput('Anonymous User');
        }
    }

    // Automatic highlight userInput textbox when editing ✅
    useEffect(() => {
        const userInputTextboxElement = document.getElementById('user');
        userInputTextboxElement.select();
    }, [isEditingUser])

    return (
        <form onSubmit={handleSubmitUser}>
            <label htmlFor="user">Current User: </label>
            <input type="text" id="user" onChange={handleUserChange} value={userInput} placeholder='Anonymous User' disabled={ isEditingUser ? null : 'disabled'} />
            {
                isEditingUser ? <button type="submit">Set User</button>
                : <button type='button' onClick={handleSetIsEditingUser}>Change User</button>
            }
        </form>
    )
}