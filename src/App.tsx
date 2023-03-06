import React, { useEffect, useState } from 'react'
import { collection, doc, setDoc, getDocs, query, orderBy, startAt, deleteDoc } from "firebase/firestore";
import { db } from './infra/firebase';

import './styles.scss'

interface UserProps {
  age: string
  steamID: string
  user: string
}

interface MyInterface extends Array<UserProps> { }

export const App = () => {

  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [steamID, setSteamID] = useState('')

  const [users, setUsers] = useState<MyInterface>()


  const submitTest = async () => {
    await setDoc(doc(db, "users", steamID), {
      user: username,
      age: age,
      steamID: steamID
    });

    getUsers()
  }

  const getUsers = async () => {
    const colRef = collection(db, "users");
    const docsSnap = await getDocs(colRef);
    const usersArray: any = []

    docsSnap.forEach(doc => {
      usersArray.push(doc.data());
    })

    setUsers(usersArray)
  }

  const deleteUser = async (steamID: string) => {
    await deleteDoc(doc(db, 'users', steamID))
    getUsers()
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <>
      <form className="App">
        <div>
          <label>Username: </label>
          <input onChange={(e) => setUsername(e.currentTarget.value)} />
        </div>

        <div>
          <label>Age: </label>
          <input onChange={(e) => setAge(e.currentTarget.value)} />
        </div>

        <div>
          <label>SteamID: </label>
          <input onChange={(e) => setSteamID(e.currentTarget.value)} />
        </div>

        <button type='button' onClick={() => submitTest()}>Registrar info</button>

      </form>

      <div>
        <h3>Users Online</h3>

        {users?.map((user, key) => {
          return (
            <div className='user-area'>
              <h4 key={key}>{user.user}</h4>
              <button type='button' onClick={() => deleteUser(user.steamID)}>Deletar</button>
            </div>
          )
        })
        }
      </div>
    </>
  )
}
