// Import Styles
import './App.css';

// Import React Methods
import { useState, useEffect } from 'react';

// Import Firebase and Firebase Methods
import firebase from './scripts/firebase';
import { getDatabase, ref, onValue, push, remove, get } from 'firebase/database';

function App() {

    // Store current listKey for editing and display
    const [listKey, setListKey] = useState('');

    // Controlled input for list user
    const [user, setUser] = useState(`Anonymous`)
    const handleUserChange = (e) => {
        setUser(e.target.value);
    }

    // Controlled input for list title
    const [title, setTitle] = useState(`Anonymous's List`)
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }

    // Pushes a new list into Firebase with user, title, and time
    const handleListInfoSubmit = (e) => {
        e.preventDefault();
        const database = getDatabase(firebase);
        const dbRef = ref(database);

        // Helper function to make 1-digit months and days two digits (e.g. January 0 => 01)
        function twoDigits(num) {
            return (num < 10 ? '0' : '') + num;
        }

        const  currentDate = new Date();
        const currentTime = currentDate.getFullYear().toString()
            + twoDigits(currentDate.getMonth() + 1)
            + twoDigits(currentDate.getDate())
            + currentDate.getHours()
            + currentDate.getMinutes()
            + currentDate.getSeconds()
            + currentDate.getMilliseconds();
        
        const firebaseObj = push(dbRef, {
            user: user,
            title: title,
            time: currentTime,
            listItem: {}
        });
        
        // Update the current working key for later use
        setListKey(firebaseObj.key);
    }

    return (
        <div className="App">
            <h1>Public List</h1>

            {/* Form for creating new list */}
            <form onSubmit={handleListInfoSubmit}>
                <label htmlFor="user">List Author: </label>
                <input type="text" id="user" onChange={handleUserChange} value={user} required/>
                
                <label htmlFor="listTitle">List Title</label>
                <input type="text" id="title" onChange={handleTitleChange} value={title} required/>

                <button type="submit">Make my list!</button>
            </form>

        </div>
    );
}

export default App;
