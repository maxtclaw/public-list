import './App.css';

// Import Firebase and Firebase Methods
import firebase from './firebase';
import { getDatabase, ref, onValue } from 'firebase/database';

// Import React Methods and Components
import { useState, useEffect } from 'react';
import DisplayUserLogin from './components/DisplayUserLogin';
import SectionLists from './components/SectionLists';
import SectionListItems from './components/SectionListItems';

// Firebase variables
const database = getDatabase(firebase);
const dbRef = ref(database);

function App() {

	// Root Firebase objects
	const [listsObject, setListsObject] = useState({});

	// Current userKey and listKey
	const [userKey, setUserKey] = useState('Anonymous User');
	const [listKey, setListKey] = useState('');

	// State to check how to display user ✅
	// Also disables all other elements to avoid errors
	const [isEditingUser, setIsEditingUser] = useState(false);

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
			{/* Component for receiving user login */}
			<DisplayUserLogin
				userKey={userKey}
				setUserKey={setUserKey}
				isEditingUser={isEditingUser}
				setIsEditingUser={setIsEditingUser}
				setListKey={setListKey}
			/>

			<div className="wrapper">

				<header>
					<h1>Public List</h1>
					<p>A place to make and share your lists, public or private.</p>
				</header>

				{
					// Only display main if not currently adjusting the user 
					isEditingUser ?
						<div>
							<h2 className='italic colorTextSecondary'>Confirm your user to continue viewing lists</h2>
						</div> :
						<main>
							{/* List Section - For List Creation and Display */}
							<SectionLists
								database={database}
								dbRef={dbRef}
								listsObject={listsObject}
								userKey={userKey}
								listKey={listKey}
								setListKey={setListKey}
							/>


							{/* List Item Section for List Item Creation and Display*/}
							<SectionListItems
								database={database}
								listsObject={listsObject}
								userKey={userKey}
								listKey={listKey}
								setListKey={setListKey}
							/>
						</main>
				}
			</div>

			<footer>
				<p>Website Created by <a href="https://github.com/maxtclaw"><span>🌱</span> Max &nbsp;</a> at Juno College</p>
			</footer>

		</div>
	);
}

export default App;
