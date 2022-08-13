import { ref, remove } from 'firebase/database';

export default function Lists({ database, listsObject, listKey, setListKey }) {
    
    // Convert listsObject to array for mapping
    const listsArray = Object.entries(listsObject);

    // Handle deletion of lists ✅
    const handleRemoveList = function (listKeyParam) {
        const dbListRef = ref(database, `/${listKeyParam}`);
        
        // Clear listKey if deleting current list
        if (listKey === listKeyParam) {
            setListKey('');
        }
        remove(dbListRef);
    }

    return (
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
                                    <button onClick={() => { setListKey(listObjectKey) }}>view this list</button>
                                    <button onClick={() => { handleRemoveList(listObjectKey) }}>X</button>
                                    <h3>{listTitle}</h3>
                                    <h4>{listUser}</h4>
                                    <p>Number of items in this list: {list[1].listItems ? Object.keys(list[1].listItems).length : 0}</p>
                                </li>
                            )
                        })
                    } </ul>
                </div> : <p>There are currently <strong>0 public lists</strong></p>
            }
        </div>
    )
}