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
const objectToArray = function(obj) {
    return JSON.parse(JSON.stringify(Object.entries(obj)))
}

const copyArrayObject = function (arr) {
    return JSON.parse(JSON.stringify(arr));
}

function App() {

    // STATES -------------------------------------------------------------------------------------
    // Store current listKey for editing and display
    const [listKey, setListKey] = useState('');
    const [listsArray, setListsArray] = useState([]);

    const [listItems, setListItems] = useState([]);
    const sortSetListItems = function(listItems) {
        const sortedListItems = objectToArray(listItems).sort((a, b) => {
            return (a[1].index < b[1].index ? -1 : 1)
        })
        setListItems(sortedListItems);
    }

    // CONTROLLED INPUTS --------------------------------------------------------------------------
    // CREATING NEW LISTS ---------------------------------
    // Controlled input for list user ✅
    const [user, setUser] = useState(`Anonymous`)
    const handleUserChange = function(e) {
        setUser(e.target.value);
    }

    // Controlled input for list title ✅
    const [titleInput, setTitleInput] = useState(`Anonymous's List`)
    const handleTitleChange = function(e) {
        setTitleInput(e.target.value);
    }

    // CREATING LIST ITEMS --------------------------------
    // Controlled input for list item text ✅
    const [listItemTextInput, setListItemTextInput] = useState('');
    const handleListItemTextChange = function(e) {
        setListItemTextInput(e.target.value);
    }


    // HANDLERS -----------------------------------------------------------------------------------
    // LIST BUTTON HANDLERS -------------------------------
    // Display list item for the given key✅
    const handleDisplayList = function(key) {

        setListKey(key);

        const listRef = ref(database, `/${key}`);
        get(listRef).then((list) => {
            // Update listItems state if there are list items, otherwise keep state empty
            if ('listItems' in list.val()) {
                sortSetListItems(list.val().listItems)
            } else (
                setListItems([])
            )
        })
    }

    // Pushes a new list into Firebase with user, title, and time ✅
    const handleSubmitList = function(e) {
        e.preventDefault();

        // Helper function to make 1-digit months and days two digits (e.g. January => 0 => 01)
        const twoDigits = (num) => { return (num < 10 ? '0' : '') + num };

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
        
        // Update the current working key for later use, and the current list
        setListKey(firebaseObj.key);
        handleDisplayList(firebaseObj.key);
    }

    // Deletes a list from Firebase
    const handleRemoveList = function (listKey) {
        const dbListRef = ref(database, `/${listKey}`)

        setListItems([]);
        remove(dbListRef);
    }



    // LIST ITEMS BUTTON HANDLERS -------------------------
    // Pushes list item into the active list ✅
    const handleSubmitListItem = function(e) {
        e.preventDefault();

        // Ensure there is a list key
        if (listKey && listItemTextInput) {
            const dbListItemsRef = ref(database, `/${listKey}/listItems`)

            const itemIndex = listItems.length;
            push(dbListItemsRef, {
                index: itemIndex,
                text: listItemTextInput
            }).then(() => {
                get(dbListItemsRef).then((listItemsUpdated) => {
                    const list = listItemsUpdated.val();
                    // Update display state
                    sortSetListItems(list)
                    setListItemTextInput('');
                })
            })



        }

    }

    // Removes individual list items, and shifts indices accordingly ✅
    const handleRemoveListItem = function(listKey, listItemKey) {
        const dbListItemsRef = ref(database, `/${listKey}/listItems`)

        // Filter out keyed item, and shift indices
        const newListItemsArray = listItems.filter((item) => {
            return item[0] !== listItemKey;
        }).map((item, itemIndex) => {
            item[1].index = itemIndex;
            return item
        });

        // Create object with updated item indices for Firebase
        const newListItemsObject = {};
        newListItemsArray.forEach((item) => {
            newListItemsObject[item[0]] = item[1];
        })

        // Update state and Firebase
        setListItems(newListItemsArray);
        set(dbListItemsRef, newListItemsObject)
    }


    // USE EFFECT ---------------------------------------------------------------------------------
    useEffect(() => {

        // Update state for displaying listsArray
        onValue(dbRef, (response) => {
            if (response.exists()) {
                setListsArray(objectToArray(response.val()))
            } else {
                setListsArray([])
            }
        })

    }, [])



    return (
        <div className="App">

            <h1>Public List</h1>

            {/* Form for creating new list */}
            <form onSubmit={handleSubmitList}>
                <label htmlFor="user">List Author: </label>
                <input type="text" id="user" onChange={handleUserChange} value={user} required/>
                
                <label htmlFor="listTitle">List Title</label>
                <input type="text" id="title" onChange={handleTitleChange} value={titleInput} required/>

                <button type="submit">Make my list!</button>
            </form>

            {/* Form for adding new list items */}
            <form onSubmit={handleSubmitListItem}>
                <input type="text" name="listItem" id="listItem" value={listItemTextInput} onChange={ handleListItemTextChange} placeholder='list item' required/>
                <button type="submit">Submit</button>
            </form>

            {/* For Debugging # */}
            <p>Your current key is {listKey}</p>

            {/* Div for displaying all of the existing lists */}
            <div>
                {
                    listsArray.length ? <div>
                        <h2>There are {listsArray.length} lists</h2> 
                        <ul> {
                        listsArray.map((list) => {
                            return (
                                <li key={list[0]}>
                                    <button onClick={() => { handleDisplayList(list[0]) }}>view this list</button>
                                    <button onClick={() => { handleRemoveList(list[0]) }}>X</button>
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
                                    <button onClick={() => { handleRemoveListItem(listKey, item[0]) }}>X</button>
                                    <p>{item[1].text}</p>
                                </li>
                            )
                        })
                    } </ul> : <p>There's currently nothing in your selected list!</p>
                }
            </div>
            
        </div>
    );
}

export default App;
