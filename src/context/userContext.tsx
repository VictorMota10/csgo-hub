import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext({})

const UserProvider = ({ children }: { children: any }) => {
  const [username, setUsername] = useState('')
  const [steamID, setSteamID] = useState('')
  const [avatar, setAvatar] = useState('')
  const [email, setEmail] = useState('')
  const [uidCurrent, setUidCurrent] = useState('')

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        steamID,
        setSteamID,
        avatar,
        setAvatar,
        email,
        setEmail, 
        uidCurrent,
        setUidCurrent
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

function useUser() {
  const context: any = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context;
}

export { UserProvider, useUser };