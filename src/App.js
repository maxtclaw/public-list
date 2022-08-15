import './App.css';

// Import Firebase and Firebase Methods
import firebase from './firebase';
import { getDatabase, ref, onValue } from 'firebase/database';

// Import React Methods and Components
import { useState, useEffect } from 'react';
import DisplayUserLogin from './DisplayUserLogin';
import DisplayCreateList from './DisplayCreateList';
import DisplayLists from './DisplayLists'
import DisplayCreateListItem from './DisplayCreateListItem';
import DisplayListItems from './DisplayListItems';

// Firebase variables
const database = getDatabase(firebase);
const dbRef = ref(database);

function App() {

	// Root Firebase objects
	const [listsObject, setListsObject] = useState({});

	// Current userKey and listKey
	const [userKey, setUserKey] = useState('Anonymous User');
	const [listKey, setListKey] = useState('');

	// useEffect to keep root Firebase objects updated ✅
	useEffect(() => {
		onValue(dbRef, (response) => {
			if (response.exists()) {
				setListsObject(response.val());
			} else {
				setListsObject({});
			}
		})
	}, [])


	return (
		<div className="App">

		<h1>Public List</h1>
		<DisplayUserLogin userKey={userKey} setUserKey={setUserKey} />

		{/* TODO: Fix bug where lists can be created while setting userKey */}
		<DisplayCreateList dbRef={dbRef} userKey={userKey} setListKey={setListKey} />

		<DisplayLists database={database} listsObject={listsObject} userKey={userKey} listKey={listKey} setListKey={setListKey} />

		{
			// Display list items if there is a list is selected
			listKey ? <>
				{listsObject[listKey]['user'] === userKey ?
					<DisplayCreateListItem database={database} listsObject={listsObject} listKey={listKey} setListKey={setListKey} />
					: null}
				<DisplayListItems database={database} listsObject={listsObject} userKey={userKey} listKey={listKey} setListKey={setListKey} />
			</> : null
		}
		
		</div>
	);
}

export default App;
