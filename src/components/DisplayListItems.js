import { ref, set, update } from "firebase/database";
import { useEffect } from "react";
import { useState } from "react"

export default function DisplayListItems({ database, listsObject, userKey, listKey, setListKey }) {

    // Handles state of item editing ✅
    const [editListItemKey, setEditListItemKey] = useState('');

    // Controlled input for editing list item ✅
    const [editListItemTextInput, setEditListItemTextInput] = useState('')
    const handleEditListItemTextInput = function (e) {
        setEditListItemTextInput(e.target.value)
    }

    // Uses Firebase set() to update listItem indices on item deletion or shifting ✅
    // adjustTypes: 'remove', 'up', 'down'
    const adjustListItemIndex = function (adjustType, listItemKeyParam) {

        // Adjust indices only if there are items to adjust
        if (listsObject[listKey]['listItems']) {

            const dbListItemsRef = ref(database, `/${listKey}/listItems`);

            const listItemsObject = listsObject[listKey]['listItems'];
            const listItemsArray = Object.entries(listsObject[listKey]['listItems']);

            // Change the new array depending on the adjustment type
            if (adjustType === 'remove') {

                // Variable for manipulating before updating Firebase
                let newListItemsArray = []; 
                 // Object for updating Firebase
                const newListItemsObject = {};
                
                // Filter out and sort the current list items
                newListItemsArray = listItemsArray.filter((item) => {
                    return item[0] !== listItemKeyParam;
                }).sort((a, b) => {
                    return (a[1].index < b[1].index ? -1 : 1)
                })

                // Build the new object to update indices
                newListItemsArray.forEach((item, itemIndex) => {
                    newListItemsObject[item[0]] = {
                        index: itemIndex,
                        text: item[1].text
                    }
                })

                // Update database with the new object
                set(dbListItemsRef, newListItemsObject)
            }
            
            // Update the database if items are shifted up or down
            else if (adjustType === 'up' || adjustType === 'down') {

                const currItemIndex = listItemsObject[listItemKeyParam].index;

                let swapItemIndex = -1;
                if (adjustType === 'up') {
                    swapItemIndex = currItemIndex - 1;
                } else if (adjustType === 'down') {
                    swapItemIndex = currItemIndex + 1;
                }

                if ((adjustType === 'up' && currItemIndex !== 0) || (adjustType === 'down' && currItemIndex !== listItemsArray.length - 1)) {

                    let swapItemArray = {};
                    let currItemArray = {};

                    // Swap the indices for the current item to shift up/down
                    listItemsArray.forEach((item) => {
                        if (item[1].index === swapItemIndex) {
                            swapItemArray = item;
                            swapItemArray[1]['index'] = currItemIndex;
                        } else if (item[1].index === currItemIndex) {
                            currItemArray = item;
                            currItemArray[1]['index'] = swapItemIndex;
                        }
                    })

                    const updateListItemsObject = {
                        [swapItemArray[0]]: {
                            index: swapItemArray[1].index,
                            text: swapItemArray[1].text
                        },
                        [currItemArray[0]]: {
                            index: currItemArray[1].index,
                            text: currItemArray[1].text
                        }
                    }

                    update(dbListItemsRef, updateListItemsObject);
                } else {
                    alert(`You can't move this item any more ${adjustType}, because it's at the end`)
                }
            }

            else {
                alert('There has been an erroneous adjustType parameter to adjustListItemIndex')
            }

        }

    }

    // Remove list item at given listItemKey ✅
    const handleRemoveListItem = function (listItemKeyParam){
        adjustListItemIndex('remove', listItemKeyParam);
    }

    // Edits list item at given listItemKey ✅
    const handleSelectEditListItem = function (e, listItemKeyParam, listItemTextParam) {
        setEditListItemKey(listItemKeyParam);
        setEditListItemTextInput(listItemTextParam);
    }

    // Automatically highlight listItem textbox when editing ✅
    useEffect(() => {
        const editListItemTextboxElement = document.getElementById(`editListItem`);
        if (editListItemTextboxElement) {
            editListItemTextboxElement.select()
        }
    }, [editListItemKey])

    // Handle submission of edited listItem ✅
    const handleSubmitEditListItem = function (e, listKeyParam, listItemKeyParam, editListItemTextParam) {
        e.preventDefault()

        // Updates if text is present, otherwise, list item is deleted
        if (editListItemTextParam) {
            const dbListItemRef = ref(database, `/${listKeyParam}/listItems/${listItemKeyParam}`)
            const newListItemObject = {
                index: listsObject[listKey]['listItems'][listItemKeyParam].index,
                text: editListItemTextParam
            }

            set(dbListItemRef, newListItemObject)
            setEditListItemKey('');
            setEditListItemTextInput('');

            
        } else {
            handleRemoveListItem(listItemKeyParam)
        }
    }

    // Handle shifting of listItems ✅
    const handleShiftListItem = function (direction, listItemKeyParam) {
        if (direction === 'up') {
            adjustListItemIndex('up', listItemKeyParam)
        } else if (direction === 'down') {
            adjustListItemIndex('down', listItemKeyParam)
        }
    }

    // Nested check is required in case someone else deletes a list you are currently viewing
    if (listKey) {
        if (listsObject[listKey]) {
            if ('listItems' in listsObject[listKey]) {
    
                // Sort the list items for display according to the listItem index
                const listItems = Object.entries(JSON.parse(JSON.stringify(listsObject[listKey]['listItems']))).sort((a, b) => {
                    return (a[1].index < b[1].index ? -1 : 1)
                })
    
                return (<ol className="displayListItemsContainer">
                    {
                        listItems.map((item, itemIndex, itemArray) => {
                            
                            const itemKey = item[0];
                            const itemText = item[1].text;
    
                            return (
                                <li key={itemKey}>

                                    {/* Buttons left of each listItem: Move Up/Move Down */}
                                    <div className="listItemLeft">
                                        {
                                            listsObject[listKey].user === userKey ?
                                                (<div className="listItemMoveContainer">
                                                    <button className="listItemMove" onClick={() => { handleShiftListItem('up', itemKey) }} disabled={itemIndex === 0} aria-label="move list item up">
                                                        <i className="fa-solid fa-angle-up"></i>
                                                    </button>
                                                    <button className="listItemMove" onClick={() => { handleShiftListItem('down', itemKey) }} disabled={itemIndex === itemArray.length - 1} aria-label="move list item down">
                                                        <i className="fa-solid fa-angle-down"></i>
                                                    </button>
                                                </div>) : null
                                        }
                                        <p className="listItemIndex">{itemIndex + 1}.</p>
                                    </div>

                                    {/* List Item Text (or edit box) */}
                                    <div className="listItemTextContainer">
                                    {
                                            itemKey === editListItemKey && listsObject[listKey].user === userKey ?
                                                <form onSubmit={(e) => { handleSubmitEditListItem(e, listKey, itemKey, editListItemTextInput) }}>
                                                <label htmlFor="editListItem" className="sr-only">Edit list item text</label>
                                                <input type="text" id="editListItem" onChange={handleEditListItemTextInput} value={editListItemTextInput}/>
                                            </form> : <p onClick={(e) => { handleSelectEditListItem(e, itemKey, itemText) }}>{itemText}</p>
                                        }
                                    </div>

                                    {/* Buttons right of each listItem: Edit, Confirm Edit, Delete */}
                                    {
                                        listsObject[listKey].user === userKey ?
                                            (<div className="listItemRightContainer">
                                                {
                                                    itemKey === editListItemKey ?
                                                        <button type="button" className="listItemSubmit buttonCircle" onClick={(e) => { handleSubmitEditListItem(e, listKey, itemKey, editListItemTextInput) }} aria-label="submit list item edit">
                                                            <i className="fa-solid fa-check"></i>
                                                        </button> :
                                                        <button type="button" className="listItemModify buttonCircle" onClick={(e) => { handleSelectEditListItem(e, itemKey, itemText) }} aria-label="edit list item">
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                }
                                                <button className="listItemDelete buttonCircle" onClick={() => { handleRemoveListItem(itemKey) }} aria-label="delete list item">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>) : null
                                    }
                                </li>
                            )

                        })
                    }
                </ol>)
    
            } else {
                return (<div className="emptyListText">
                    <p className="italic colorTextSecondary">This list currently has no items.</p>
                </div>)
            }
        } else {
            setListKey('')
            alert('Error Displaying - This list does not exist, or has been deleted.')
        }
    } else {
        return (<div>
            <p className="italic colorTextSecondary">No list was selected. Pick a list to see what's inside!</p>
        </div>)
    }
    
}