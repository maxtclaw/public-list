import DisplayCreateList from "./DisplayCreateList";
import DisplayLists from "./DisplayLists";

export default function SectionLists({ database, dbRef, listsObject, userKey, listKey, setListKey }) {
    return (
        <section>
            <DisplayCreateList dbRef={dbRef} userKey={userKey} setListKey={setListKey} />
            <DisplayLists database={database} listsObject={listsObject} userKey={userKey} listKey={listKey} setListKey={setListKey} />
        </section>
        
    )
}