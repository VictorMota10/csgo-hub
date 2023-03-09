import { goOffline, goOnline, ref, set } from "firebase/database";
import uuid from "react-uuid";
import { realtime_db } from "../infra/firebase";

export const registerPlayer = async (data: any) => {
  let userCreated;

  const uuidSaved = uuid();
  const newPlayer: any = {
    playerData: {
      firstName: data.firstName,
      lastName: data.lastName,
      steamID: data.steamID,
      username: data.username,
      email: data.email,
    },
  };

  goOnline(realtime_db);
  try {
    await set(ref(realtime_db, "users/" + uuidSaved), newPlayer);
    userCreated = {
      id: uuidSaved,
      newPlayer,
    };
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return userCreated;
};