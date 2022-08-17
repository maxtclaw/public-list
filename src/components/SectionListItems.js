import DisplayListItems from "./DisplayListItems";
import DisplayCreateListItem from "./DisplayCreateListItem";

export default function SectionListItems({ database, listsObject, userKey, listKey, setListKey}) {

    return (
        // First see if a list was selected, and display only if that list exists in the database
        listKey ? <>
            {listsObject[listKey] ?
                <section>
                    <DisplayListItems
                        database={database}
                        listsObject={listsObject}
                        userKey={userKey}
                        listKey={listKey}
                        setListKey={setListKey}
                    />

                    {listsObject[listKey]['user'] === userKey ?
                        <DisplayCreateListItem
                            database={database}
                            listsObject={listsObject}
                            listKey={listKey}
                            setListKey={setListKey}
                        /> : null}
                    
                </section> : null}
        </> : null
    )
}