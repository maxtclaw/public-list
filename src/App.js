import './App.css';

// Import Firebase and Firebase Methods
import firebase from './firebase';
import { getDatabase, ref, onValue } from 'firebase/database';

// Import React Methods and Components
import { useState, useEffect } from 'react';
import DisplayUserLogin from './components/DisplayUserLogin';
import DisplayCreateList from './components/DisplayCreateList';
import DisplayLists from './components/DisplayLists'
import DisplayCreateListItem from './components/DisplayCreateListItem';
import DisplayListItems from './components/DisplayListItems';

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
			<DisplayUserLogin userKey={userKey} setUserKey={setUserKey} isEditingUser={isEditingUser} setIsEditingUser={setIsEditingUser} setListKey={setListKey} />

			<div className="wrapper">

				<header>
					<h1>Public List</h1>
					<p>A place to make and share your lists, public or private.</p>
				</header>

				{
					// Only display main if not currently adjusting the user 
					isEditingUser ? null :
						<main>
							{
								<>
									<section>
										<DisplayCreateList dbRef={dbRef} userKey={userKey} setListKey={setListKey} />
										<DisplayLists database={database} listsObject={listsObject} userKey={userKey} listKey={listKey} setListKey={setListKey} />
									</section>

									<section>
										{
											// Display list items only if there is a list is selected
											listKey ? <>
												{listsObject[listKey] ?
													<>
														<DisplayListItems database={database} listsObject={listsObject} userKey={userKey} listKey={listKey} setListKey={setListKey} />
														{listsObject[listKey]['user'] === userKey ?
															<DisplayCreateListItem database={database} listsObject={listsObject} listKey={listKey} setListKey={setListKey} />
															: null}
													</>
													: null}
											</> : null
										}
									</section>
								</>
							}
						</main>
				}
			</div>

			<footer>
				<p>A Website Created by  <a href="https://github.com/maxtclaw"><span>🌱</span> Max &nbsp;</a></p>
			</footer>

		</div>
	);
}

export default App;
