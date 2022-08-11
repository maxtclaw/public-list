// Import Styles
import './App.css';

// Import React Methods
import { useState, useEffect } from 'react';

// Import Firebase and Firebase Methods
import firebase from './scripts/firebase';
import { getDatabase, ref, onValue, push, remove, get, set } from 'firebase/database';
const database = getDatabase(firebase);
const dbRef = ref(database);

// Helper Function
const objectToArray = function (obj) {
    return JSON.parse(JSON.stringify(Object.entries(obj)))
}

function App() {

    // STATES -------------------------------------------------------------------------------
    // Store current listKey for editing and display
    const [listKey, setListKey] = useState('');
    const [listsArray, setListsArray] = useState([]);
    const [listsObject, setlistsObject] = useState({});

    const [listItems, setListItems] = useState([]);
    const sortSetListItems = function (listItems) {
        const sortedListItems = objectToArray(listItems).sort((a, b) => {
            return (a[1].index < b[1].index ? -1 : 1)
        })
        setListItems(sortedListItems);
    }

    // CONTROLLED INPUTS --------------------------------------------------------------------
    // CREATING NEW LISTS ---------------------------------
    // Controlled input for list user
    const [user, setUser] = useState(`Anonymous`)
    const handleUserChange = (e) => {
        setUser(e.target.value);
    }

    // Controlled input for list title
    const [titleInput, setTitleInput] = useState(`Anonymous's List`)
    const handleTitleChange = (e) => {
        setTitleInput(e.target.value);
    }

    // CREATING LIST ITEMS --------------------------------
    // Controlled input for list item text
    const [listItemTextInput, setListItemTextInput] = useState('');
    const handleListItemTextChange = (e) => {
        setListItemTextInput(e.target.value);
    }


    // SUBMIT BUTTON HANDLERS --------------------------------------------------------------
    // Pushes a new list into Firebase with user, title, and time
    const handleListInfoSubmit = (e) => {
        e.preventDefault();

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
            title: titleInput,
            time: currentTime,
            listItems: {}
        });
        
        // Update the current working key for later use
        setListKey(firebaseObj.key);
    }

    // Pushes list item into the active list
    const handleListItemSubmit = (e) => {
        e.preventDefault();

        // Ensure there is a list key
        if (listKey && listItemTextInput) {
            const dbListItemsRef = ref(database, `/${listKey}/listItems`)

            let itemIndex = 0;
            get(dbListItemsRef).then((listItems) => {

                // Increase the item index depending on how many items are present currently
                if (listItems.val() !== null) {
                    itemIndex = Object.keys(listItems.val()).length;
                }

                // Push the list item entry into firebase
                const listItemKey = push(dbListItemsRef, {
                    index: itemIndex,
                    text: listItemTextInput
                })['key']

                    

                get(dbListItemsRef).then((listItemsUpdated) => {

                    const list = listItemsUpdated.val();
                    sortSetListItems(list)

                })

                // Clear the text input
                setListItemTextInput('');

            })
        }

    }


    useEffect(() => {

        // Update state for listsArray
        onValue(dbRef, (response) => {
            if (response.val() !== null) {
                setListsArray(objectToArray(response.val()))
                setlistsObject(response.val());
            } else {
                setListsArray([])
                setlistsObject({})
            }
        })

        // Update state for list items
        const dbListItemsRef = ref(database, `/${listKey}/listItems`)
        onValue(dbListItemsRef, (response) => {
            if (response.val() !== null) {
                sortSetListItems(response.val())
            } else {
                setListItems([])
            }
        })

    }, [])



    return (
        <div className="App">
            <h1>Public List</h1>

            {/* Form for creating new list */}
            <form onSubmit={handleListInfoSubmit}>
                <label htmlFor="user">List Author: </label>
                <input type="text" id="user" onChange={handleUserChange} value={user} required/>
                
                <label htmlFor="listTitle">List Title</label>
                <input type="text" id="title" onChange={handleTitleChange} value={titleInput} required/>

                <button type="submit">Make my list!</button>
            </form>

            {/* Form for adding new list items */}
            <form onSubmit={handleListItemSubmit}>
                <input type="text" name="listItem" id="listItem" value={listItemTextInput} onChange={ handleListItemTextChange} placeholder='list item' required/>
                <button type="submit">Submit</button>
            </form>

            {/* Div for displaying all of the existing lists */}
            <div>
                
                {
                    listsArray.length ? <div>
                        <h2>There are {listsArray.length} lists</h2> 
                        <ul> {
                        listsArray.map((list) => {
                            return (
                                <li key={list[0]}>
                                    <h3>{ list[1].title }</h3>
                                    <h4>{ list[1].user }</h4>
                                </li>
                            )
                        })
                    } </ul> 
                    </div> : <p>There are currently no public lists...</p>
                }
            </div>
            
            {/* Div for displaying everything in the current list */}
            <div>
                {
                    listItems.length ? <ul> {
                        listItems.map((item) => {
                            return (
                                <li key={item[0]}>
                                    <p>{item[1].text}</p>
                                </li>
                            )
                        })
                    } </ul> : <p>There's currently nothing in your list!</p>
                }
            </div>



            
        </div>
    );
}

export default App;
