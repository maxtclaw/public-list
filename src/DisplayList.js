import { ref, update, remove } from 'firebase/database'
import { useState } from 'react'

export default function DisplayList({ database, userKey, listKey, setListKey, list }) {

    const listObjectKey = list[0];
    const listTitle = list[1].title;
    const listAuthor = list[1].author;
    const listUser = list[1].user;
    const listHidden = list[1].hidden;

    // Controlled input for list hidden ✅
    // TODO: Fix weird quirk, will require two clicks to properly register
    const [hiddenInput, setHiddenInput] = useState(listHidden);
    const handleHiddenInput = function (listKeyParam) {
        setHiddenInput(!hiddenInput);

        const updateObj = {hidden: hiddenInput}
        const dbListRef = ref(database, `/${listKeyParam}`);
        update(dbListRef, updateObj)
    } 

    // Handle deletion of list ✅
    const handleRemoveList = function (listKeyParam) {
        const dbListRef = ref(database, `/${listKeyParam}`);

        // Clear listKey if deleting current list
        if (listKey === listKeyParam) {
            setListKey('');
        }
        remove(dbListRef);
    }


    return (
        <>
            {/* TODO: Add option to edit list title and author */}
            <h2>{listTitle}</h2>
            <h3>By: {listAuthor}</h3>
            <h4>({listHidden ? <>Private List</> : <>Public List</>})</h4>
            <p>Number of items in this list: {list[1].listItems ? Object.keys(list[1].listItems).length : 0}</p>
            <div>
                {
                    // Enable Delete and hidden option if you are the listUser
                    (listUser === userKey && listUser !== 'Anonymous User') ? <>
                        <input type="checkbox" id="editHidden" checked={listHidden} onChange={() => { handleHiddenInput(listObjectKey) }} />
                        <label htmlFor="editHidden"> Make List Private </label>

                        <button onClick={() => { handleRemoveList(listObjectKey) }}>Delete List</button>
                    </> : null
                }
            </div>
        </>
    )
}