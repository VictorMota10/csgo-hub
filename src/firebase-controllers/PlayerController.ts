import { child, get, goOffline, goOnline, ref, set } from "firebase/database";
import { realtime_db } from "../infra/firebase";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts?.pop()?.split(";").shift();
}

export const registerPlayer = async (data: any, uid: string) => {
  let userCreated;

  const newPlayer: any = {
    playerData: {
      firstName: data.firstName,
      lastName: data.lastName,
      steamID: data.steamID,
      username: data.username,
      email: data.email,
      avatar: data.avatar
    },
  };

  goOnline(realtime_db);
  try {
    await set(ref(realtime_db, "users/" + uid), newPlayer);
    userCreated = {
      id: uid,
      newPlayer,
    };
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return userCreated;
};

export const getPlayerBySteamID = async (steamID: string) => {
  const dbRef = ref(realtime_db);
  let players: any = [];
  let playerSearched: any = [];
  try {
    goOnline(realtime_db);
    await get(child(dbRef, `users`))
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

  players?.forEach((player: any) => {
    if (
      player[Object.getOwnPropertyNames(player)[0]]?.playerData?.steamID ===
        steamID &&
      player[Object.getOwnPropertyNames(player)[0]]?.playerData?.steamID !==
        getCookie("steamID")
    ) {
      playerSearched =
        player[Object.getOwnPropertyNames(player)[0]]?.playerData;
    }
  });

  return playerSearched;
};

export const getPlayerByUsername = async (username: string) => {
  const dbRef = ref(realtime_db);
  let players: any = [];
  let playerSearched: any = [];
  try {
    goOnline(realtime_db);
    await get(child(dbRef, `users`))
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

  players?.forEach((player: any, index: any) => {
    if (
      player[Object.getOwnPropertyNames(player)[index]]?.playerData?.username.includes(username)
         &&
      player[Object.getOwnPropertyNames(player)[index]]?.playerData?.username !==
        getCookie("username")
    ) {
      playerSearched =
        player[Object.getOwnPropertyNames(player)[index]]?.playerData;
    }
  });

  return playerSearched;
};
