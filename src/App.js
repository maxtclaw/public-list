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

function App() {

    // STATES -------------------------------------------------------------------------------------
    // All lists for display
    const [listsArray, setListsArray] = useState([]);
    
    // Current listKey and listItems
    const [listKey, setListKey] = useState('');
    const [listItems, setListItems] = useState([]);
    const sortSetListItems = function (listItems) {
        const sortedListItems = objectToArray(listItems).sort((a, b) => {
            return (a[1].index < b[1].index ? -1 : 1)
        })
        setListItems(sortedListItems);
    }

    // CONTROLLED INPUTS --------------------------------------------------------------------------
    // CREATING NEW LISTS ---------------------------------
    // Controlled input for list user ✅
    const [user, setUser] = useState(`Anonymous`)
    const handleUserChange = function (e) {
        setUser(e.target.value);
    }

    // Controlled input for list title ✅
    const [titleInput, setTitleInput] = useState(`Anonymous's List`)
    const handleTitleChange = function (e) {
        setTitleInput(e.target.value);
    }

    // CREATING LIST ITEMS --------------------------------
    // Controlled input for list item text ✅
    const [listItemTextInput, setListItemTextInput] = useState('');
    const handleListItemTextChange = function (e) {
        setListItemTextInput(e.target.value);
    }


    // HANDLERS -----------------------------------------------------------------------------------
    // LIST BUTTON HANDLERS -------------------------------
    // Display list item for the given key✅
    const handleDisplayList = function (listKeyParam) {

        setListKey(listKeyParam);

        const dbListRef = ref(database, `/${listKeyParam}`);
        get(dbListRef).then((list) => {
            // Update listItems state if there are list items, otherwise keep state empty
            if ('listItems' in list.val()) {
                sortSetListItems(list.val().listItems)
            } else (
                setListItems([])
            )
        })
    }

    // Pushes a new list into Firebase with user, title, and time ✅
    const handleSubmitList = function (e) {
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

    // Deletes a list from Firebase ✅
    const handleRemoveList = function (listKeyParam) {
        const dbListRef = ref(database, `/${listKeyParam}`)

        setListItems([]);
        if (listKeyParam === listKey) {
            setListKey('')
        }
        remove(dbListRef);
    }



    // LIST ITEMS BUTTON HANDLERS -------------------------
    // Pushes list item into the active list ✅
    const handleSubmitListItem = function (e) {
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
    const handleRemoveListItem = function (listKeyParam, listItemKeyParam) {
        const dbListItemsRef = ref(database, `/${listKeyParam}/listItems`)

        // Filter out keyed item, and shift indices
        const newListItemsArray = listItems.filter((item) => {
            return item[0] !== listItemKeyParam;
        }).map((item, itemIndex) => {
            item[1].index = itemIndex;
            return item;
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


    // EDIT LIST ITEM HANDLERS ----------------------------
    // Handles state of item editing
    const [editListItemKey, setEditListItemKey] = useState('');

    // Controlled input for editing list item
    const [editListItemTextInput, setEditListItemTextInput] = useState('')
    const handleEditListItemTextInput = function (e) {
        setEditListItemTextInput(e.target.value)
    }

    // Selecting list item to edit
    const handleSelectEditListItem = function (listItemKeyParam, listItemTextParam) {
        setEditListItemKey(listItemKeyParam);
        setEditListItemTextInput(listItemTextParam);
    }

    // Submitting the edited list item
    const handleSubmitEditListItem = function (e, listKeyParam, listItemKeyParam, editListItemTextParam) {
        console.log(e);
        e.preventDefault();


        // Update listItems display state
        const newListItemsArray = listItems;
        newListItemsArray.map((item) => {
            const itemKey = item[0];

            if (itemKey === listItemKeyParam) {
                item[1].text = editListItemTextParam;
            }
            return item;
        })
        setListItems(newListItemsArray)


        // Update database and clear editing key
        const dbListItemTextRef = ref(database, `/${listKeyParam}/listItems/${listItemKeyParam}/text`)
        set(dbListItemTextRef, editListItemTextParam);
        setEditListItemKey('')
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
            <p>Your current list key is: <strong>{listKey ? listKey : 'no list selected'}</strong></p>
            <p>Your current list item key is: <strong>{editListItemKey ? editListItemKey : 'no list item selected'}</strong></p>

            {/* Div for displaying all of the existing lists */}
            <div>
                {
                    listsArray.length ? <div>
                        <p>There {listsArray.length === 1 ? 'is' : 'are'} currently <strong>{listsArray.length} public list{listsArray.length === 1 ? '' : 's'}</strong></p> 
                        <ul> {
                        listsArray.map((list) => {
                            
                            const listObjectKey = list[0];
                            const listTitle = list[1].title;
                            const listUser = list[1].user;

                            return (
                                <li key={list[0]}>
                                    <button onClick={() => { handleDisplayList(listObjectKey) }}>view this list</button>
                                    <button onClick={() => { handleRemoveList(listObjectKey) }}>X</button>
                                    <h3>{ listTitle }</h3>
                                    <h4>{ listUser }</h4>
                                    <p>Number of items in this list: {list[1].listItems? Object.keys(list[1].listItems).length : 0}</p>
                                </li>
                            )
                        })
                    } </ul> 
                    </div> : <p>There are currently <strong>0 public lists</strong></p>
                }
            </div>
            
            {/* Div for displaying everything in the current list */}
            <div>
                {
                    listItems.length ? <ul>
                        <p>Below here is your selected list, which has <strong>{listItems.length} items</strong></p>
                        {
                        listItems.map((item) => {

                            const itemKey = item[0];
                            const itemText = item[1].text;

                            if (editListItemKey === itemKey) {
                                return (
                                    <li key={itemKey}>
                                        <button onClick={() => { handleRemoveListItem(listKey, itemKey) }}>X</button>
                                        <form onSubmit={(e) => { handleSubmitEditListItem(e, listKey, itemKey, editListItemTextInput) }}>
                                            <label htmlFor="editListItem"></label>
                                            <input type="text" name="editListItem" id="editListItem" onChange={handleEditListItemTextInput} value={editListItemTextInput} />
                                            <button>Submit my edit</button>
                                        </form>
                                        <p>original item text: {itemText}</p>
                                    </li>
                                )          
                            } else {
                                return (
                                    <li key={itemKey}>
                                        <button onClick={() => { handleSelectEditListItem(itemKey, itemText)}}>Edit</button>
                                        <button onClick={() => { handleRemoveListItem(listKey, itemKey) }}>X</button>
                                        <p>{itemText}</p>
                                    </li>
                                )                                
                            }
                        })
                    } </ul> : <p>There's currently <strong>nothing</strong> in your selected list!</p>
                }
            </div>
            
        </div>
    );
}

export default App;
