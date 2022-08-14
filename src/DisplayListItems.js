import { ref, set, update } from "firebase/database";
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
                    console.log(`You can't move this item any more ${adjustType}, because it's at the end`)
                }
            }

            else {
                console.log('There has been an erroneous adjustType parameter to adjustListItemIndex')
            }

        }

    }

    // Remove list item at given listItemKey ✅
    const handleRemoveListItem = function (listItemKeyParam){
        adjustListItemIndex('remove', listItemKeyParam);
    }

    // Editts list item at given listItemKey ✅
    const handleSelectEditListItem = function (listItemKeyParam, listItemTextParam) {
        setEditListItemKey(listItemKeyParam);
        setEditListItemTextInput(listItemTextParam);
    }

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

    if (listKey) {
        if (listsObject[listKey]) {
            if ('listItems' in listsObject[listKey]) {
    
                // Sort the list items for display according to the item index
                const listItems = Object.entries(JSON.parse(JSON.stringify(listsObject[listKey]['listItems']))).sort((a, b) => {
                    return (a[1].index < b[1].index ? -1 : 1)
                })
    
                return (<ul>
                    {
                        listItems.map((item) => {
                            
                            const itemKey = item[0];
                            const itemText = item[1].text;
    
                            return (
                                <li key={itemKey}>

                                    {
                                        listsObject[listKey].user === userKey ?
                                            (<>
                                                <button onClick={() => { handleRemoveListItem(itemKey) }}>Delete</button>
                                                <button onClick={() => { handleSelectEditListItem(itemKey, itemText) }}>Edit this</button>
                                                <button onClick={() => {handleShiftListItem('up', itemKey)}}>Move up</button>
                                                <button onClick={() => {handleShiftListItem('down', itemKey)}}>Move down</button>
                                            </>) : null
                                    }
                                    

                                    {
                                        itemKey === editListItemKey ?
                                        <form onSubmit={(e) => { handleSubmitEditListItem(e, listKey, itemKey, editListItemTextInput) }}>
                                            <label htmlFor="editListItem"></label>
                                            <input type="text" name="editListItem" id="editListItem" onChange={handleEditListItemTextInput} value={editListItemTextInput}/>
                                            <button>Submit my edit</button>
                                        </form> : <p>{itemText}</p>
                                    }
                                    
                                </li>
                            )
    
                        })
                    }
                </ul>)
    
            } else {
                return (<div>
                    <p>This list currently has no items.</p>
                </div>)
            }
        } else {
            setListKey('')
            alert('Error Displaying - This list does not exist, or has been deleted.')
        }
    } else {
        return (<div>
            <p>No list was selected. Pick a list to see what's inside!</p>
        </div>)
    }
    
}