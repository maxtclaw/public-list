import './App.css';

// Import Firebase and Firebase Methods
import firebase from './firebase';
import { getDatabase, ref, onValue } from 'firebase/database';

// Import React Methods and Components
import { useState, useEffect } from 'react';
import DisplayCreateList from './DisplayCreateList';
import DisplayLists from './DisplayLists'
import DisplayCreateListItem from './DisplayCreateListItem';
import DisplayListItems from './DisplayListItems';

function App() {

  // Firebase variables
  const database = getDatabase(firebase);
  const dbRef = ref(database);

  // Root Firebase objects
  const [listsObject, setListsObject] = useState({});

  // Current working key
  const [listKey, setListKey] = useState('')

  // useEffect to keep root Firebase objects updated 
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

      <p>List key {listKey}</p>

      <DisplayCreateList dbRef={dbRef} setListKey={setListKey} />

      <DisplayLists database={database} listsObject={listsObject} listKey={listKey} setListKey={setListKey} />

      <DisplayCreateListItem database={database} listsObject={listsObject} listKey={listKey} setListKey={setListKey} />

      <DisplayListItems database={database} listsObject={listsObject} listKey={listKey} />
    </div>
  );
}

export default App;
