import {
  get,
  remove,
  getDatabase,
  ref,
  set,
  goOnline,
  goOffline,
  query,
  limitToLast,
  child,
} from "firebase/database";
import { realtime_db } from "../infra/firebase";

export const checkUserDataUniqueAlreadyExists = async (data: any) => {
  const dbRef = ref(realtime_db);
  let players: any = [];
  try {
    goOnline(realtime_db);
    await get(child(dbRef, "users"))
      .then((snapshot) => {
        snapshot.forEach((childSnapshot: any) => {
          players.push(snapshot.val());
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  let dataAlreadyExists: any = [] 

  players.forEach((player: any) => {
    let uuid: string = Object.getOwnPropertyNames(player)[0];
    let playerData = player[uuid].playerData;

    if (data.email === playerData.email) {
      dataAlreadyExists.push('email')
    }

    if (data.username === playerData.username) {
      dataAlreadyExists.push('username')
    }

    if (data.steamID === playerData.steamID) {
      dataAlreadyExists.push('steamID')
    }
  });

  return dataAlreadyExists;
};

export const getPlayerById = async (uid: string) => {
  let playerInfo;
  try {
    goOnline(realtime_db);
    await get(ref(realtime_db, `users/${uid}`))
      .then((snapshot) => {
        playerInfo = snapshot.val();
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return playerInfo;
};

export const deletePlayerById = async (uuid: string) => {
  goOnline(realtime_db);
  try {
    await remove(ref(realtime_db, `users/${uuid}`))
      .then((data) => {
        return;
      })
      .catch((error) => {
        console.error(error);
        return;
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);
};
