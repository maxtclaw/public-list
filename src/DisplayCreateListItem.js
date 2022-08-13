import { ref, push } from 'firebase/database'
import { useState } from "react";

export default function DisplayCreateListItem({database, listsObject, listKey, setListKey}) {

    const [listItemTextInput, setListItemTextInput] = useState('');
    const handleListItemTextChange = function (e) {
        setListItemTextInput(e.target.value);
    }

    // Handle adding new list items to the given listKey ✅
    const handleSubmitListItem = function (e) {
        e.preventDefault();

        const dbListItemsRef = ref(database, `/${listKey}/listItems`);

        // If the given listKey exists in Firebase, then add the listItem, otherwise display error
        if (Object.keys(listsObject).length) {
            const newListItemIndex = ('listItems' in listsObject[listKey]) ? Object.keys(listsObject[listKey]['listItems']).length : 0;

            setListItemTextInput('');
            push(dbListItemsRef, {
                index: newListItemIndex,
                text: listItemTextInput
            })
        } else {
            setListKey('');
            alert('Error submitting - This list either does not exist, or has been deleted.')
        }

    }

    return (
        <form onSubmit={handleSubmitListItem}>
            <input type="text" name="listItem" id="listItem" value={listItemTextInput} onChange={handleListItemTextChange} placeholder='list item' required />
            <button type="submit">Submit</button>
        </form>
    )
}