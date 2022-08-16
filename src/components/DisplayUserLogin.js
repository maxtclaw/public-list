import { useEffect, useState } from "react";

export default function DisplayUserLogin({ userKey, setUserKey, isEditingUser, setIsEditingUser, setListKey }) {

    // Track the initial userKey
    const currUser = userKey;

    // Handle setting isEditingUser state prop ✅
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

        // Reset list display if user changes from before
        if (userInput !== currUser) {
            setListKey('');
        }
    }

    // Automatic highlight userInput textbox when editing ✅
    useEffect(() => {
        const userInputTextboxElement = document.getElementById('user');
        userInputTextboxElement.select();
    }, [isEditingUser])

    return (
        <form onSubmit={handleSubmitUser} className="displayUserLogin">
            <label htmlFor="user" className="sr-only">Current User</label>
            <input type="text" id="user" onChange={handleUserChange} value={userInput} placeholder='Anonymous User' disabled={ isEditingUser ? null : 'disabled'} />
            {
                isEditingUser ? <button type="submit" className="buttonSquare buttonSquareWhite">Set User</button>
                : <button type='button' className="buttonSquare buttonSquareWhite" onClick={handleSetIsEditingUser}>Change User</button>
            }
        </form>
    )
}