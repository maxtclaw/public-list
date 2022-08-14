import { ref, remove } from 'firebase/database';
import { useEffect, useState } from 'react';
import DisplayList from './DisplayList';

export default function DisplayLists({ database, listsObject, userKey, listKey, setListKey }) {
    
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

    // Controlled input for selecting lists to display ✅
    // set to 'public' to view all public viewable lists, or 'user' for lists by userKey
    const [listsDisplaySettingInput, setListsDisplaySettingInput] = useState('public');
    const handleListDisplaySettingInputChange = function (listsDisplaySettingInputParam) {
        setListKey('')
        setListsDisplaySettingInput(listsDisplaySettingInputParam);
    }

    // useEffect to display public lists if user changes to Anonymous User ✅
    useEffect(() => {
        if (userKey === 'Anonymous User') {
            setListsDisplaySettingInput('public')
        } else {
            setListsDisplaySettingInput('user')
        }
    }, [userKey])

    // Count how many lists are in each category
    const listsCountObject = {
        total: listsArray.length,
        public: 0,
        user: 0,
        userHidden: 0
    }
    for (let i = 0; i < listsCountObject.total; i++) {
        if (listsArray[i][1].user === 'Anonymous User' || !listsArray[i][1].hidden) {
            listsCountObject.public++;
        }
        
        if (listsArray[i][1].user === userKey) {
            listsCountObject.user++;
            if (listsArray[i][1].hidden) {
                listsCountObject.userHidden++;
            }
        }
    }
    console.log(listsCountObject);


    return (
        <div>
            {
                // Allow selecting the display type
                userKey === 'Anonymous User' ? null : <form>
                    <div>
                        <input type="radio" name="listsDisplaySetting" id="listDisplaySettingUser" value='user' checked={listsDisplaySettingInput === 'user'} onChange={() => { handleListDisplaySettingInputChange('user') }} />
                        <label htmlFor='listDisplaySettingUser'>Show User Lists</label>
                    </div>
                    <div>
                        <input type="radio" name="listsDisplaySetting" id="listsDisplaySettingAll" value='public' checked={listsDisplaySettingInput === 'public'} onChange={() => { handleListDisplaySettingInputChange('public') }} />
                        <label htmlFor="listsDisplaySettingAll">Show All Lists</label>
                    </div>
                </form>
            }
            {
                // Text display for how many lists are visible (public or user, and if hidden)
                <p>There {listsCountObject[listsDisplaySettingInput] === 1 ? 'is ' : 'are '}
                    currently <strong>
                        {listsCountObject[listsDisplaySettingInput] ? listsCountObject[listsDisplaySettingInput] : <>no</>}
                        {listsDisplaySettingInput === 'user' ? <> user</> : <> publicly viewable</>} list
                        {listsCountObject[listsDisplaySettingInput] === 1 ? '' : 's'}
                        {
                            listsDisplaySettingInput === 'user' ? (
                                listsCountObject.user === 1 ?
                                    (listsCountObject.userHidden === 1 ?
                                        <> (private)</> : <> (public)</>)
                                    : listsCountObject.user > 1 ?
                                        <> ({listsCountObject.user - listsCountObject.userHidden} public, {listsCountObject.userHidden} private)</>
                                        : null
                            ) : null
                        }
                        .
                    </strong>
                    {!listsCountObject[listsDisplaySettingInput] ?
                        (listsDisplaySettingInput === 'public' ?
                            <> Why not add one yourself?</>
                            : <> Create a user list to get started!</>)
                        : null
                    }
                </p>
            }
            {
                // List display
                listsCountObject[listsDisplaySettingInput] ? <div>
                    <ul> {
                        listsArray.filter((list) => {
                            if (listsDisplaySettingInput === 'public') {
                                return (list[1].user === 'Anonymous User' || !list[1].hidden);
                            } else if (listsDisplaySettingInput === 'user') {
                                console.log(list[1].user)
                                return list[1].user === userKey;
                            }
                        }).map((list) => {
                            const listObjectKey = list[0];

                            return (
                                <li key={listObjectKey}>
                                    <button onClick={() => { setListKey(listObjectKey) }}>view this list</button>
                                    <DisplayList database={database} userKey={userKey} listKey={listKey} setListKey={setListKey} list={list} />
                                </li>
                            )
                        })
                    } </ul>
                </div> : null
            }
        </div>
    )
}