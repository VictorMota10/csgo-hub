import {
  child,
  get,
  goOffline,
  goOnline,
  ref,
  remove,
  set,
} from "firebase/database";
import { io } from "socket.io-client";
import { realtime_db } from "../infra/firebase";
import {
  lobbies,
  lobbiesChallenged,
  lobbiesReady,
} from "../utils/databaseNames";
import uuid from "react-uuid";
import { SOCKET_SERVER_URL } from "../utils/socketGlobals";

const socket = io(SOCKET_SERVER_URL);

export const createLobby = async (uidCaptain: string, captainData: any) => {
  goOnline(realtime_db);
  const lobbyID = uuid();

  try {
    // Cria lobby no banco
    await set(ref(realtime_db, `${lobbies}/${lobbyID}`), captainData);
    return lobbyID;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return false;
};

export const getLobbyData = async (lobbyID: string) => {
  const dbRef = ref(realtime_db);
  let lobbyData: any;

  goOnline(realtime_db);

  await get(child(dbRef, `${lobbies}/${lobbyID}`))
    .then((snapshot) => {
      snapshot.forEach((childSnapshot: any) => {
        lobbyData = childSnapshot.val();
      });
      return lobbyData;
    })
    .catch((error) => {
      console.error(error);
    });

  goOffline(realtime_db);

  return lobbyData;
};

export const checkPlayerAlreadyInLobby = async (uidPlayer: string) => {
  const dbRef = ref(realtime_db);
  let lobbiesData: any;
  let lobbyIDAlreadyExists: string = "";
  let alreadyExists: boolean = false;
  goOnline(realtime_db);

  await get(child(dbRef, `${lobbies}`))
    .then((snapshot) => {
      lobbiesData = snapshot.val();
    })
    .catch((error) => {
      console.error(error);
    });
  goOffline(realtime_db);

  if (lobbiesData) {
    Object.keys(lobbiesData).forEach((item: any) => {
      let players: any = lobbiesData[item]?.players;
      players?.forEach((player: any) => {
        if (player?.uid === uidPlayer) {
          lobbyIDAlreadyExists = item;
          alreadyExists = true;
        }
      });
    });
  }

  return {
    lobbyID: lobbyIDAlreadyExists,
    alreadyExists: alreadyExists,
  };
};

export const insertPlayerOnLobby = async (
  lobbyID: string,
  playersData: any
) => {
  let playerJoin = false;
  goOnline(realtime_db);

  // Insere player na lobby
  await set(ref(realtime_db, `${lobbies}/${lobbyID}/players`), playersData)
    .then(() => {
      playerJoin = true;
    })
    .catch((error) => {
      console.error(error);
    });
  goOffline(realtime_db);

  if (playerJoin) {
    socket.emit(`player_join_lobby`, {
      lobbyID: lobbyID,
      playersData,
    });
  }

  return playerJoin;
};

export const closeLobby = async (lobbyID: string) => {
  goOnline(realtime_db);
  let closed = false;

  await remove(ref(realtime_db, `${lobbies}/${lobbyID}`))
    .then(() => {
      closed = true;
    })
    .catch((error: any) => {
      console.log(error);
    });

  goOffline(realtime_db);

  if (closed) {
    socket.emit(`player_closed_lobby`, {
      lobbyID: lobbyID,
    });
  }

  return closed;
};

export const leaveLobby = async (
  playersLobby: any,
  lobbyID: string,
  uidPlayer: string
) => {
  let leaved = false;

  const playerRemovedArray = playersLobby?.filter((player: any) => {
    return player?.uid !== uidPlayer && player?.uid;
  });

  await set(
    ref(realtime_db, `${lobbies}/${lobbyID}/players`),
    playerRemovedArray
  )
    .then(() => {
      leaved = true;
    })
    .catch((error) => {
      console.error(error);
    });

  if (leaved) {
    socket.emit(`player_leave_lobby`, {
      lobbyID: lobbyID,
    });

    socket.emit(`looby_not_ready_to_play`, {
      lobbyID: lobbyID,
    });
  }

  return leaved;
};

export const setLobbyReady = async (
  lobbyID: string,
  lobbyName: string,
  playersData: any
) => {
  let lobbyReady = false;

  goOnline(realtime_db);
  await set(ref(realtime_db, `${lobbiesReady}/${lobbyID}`), {
    lobbyName: lobbyName,
    players: playersData,
  })
    .then(() => {
      lobbyReady = true;
    })
    .catch((error) => {
      console.error(error);
    });
  goOffline(realtime_db);

  if (lobbyReady) {
    await socket.emit(`looby_ready_to_play`, {
      lobbyID: lobbyID,
    });
  }

  return lobbyReady;
};

export const setLobbyUnReady = async (lobbyID: string) => {
  let lobbyUnReady = false;
  goOnline(realtime_db);
  // Insere player na lobby
  await remove(ref(realtime_db, `${lobbiesReady}/${lobbyID}`))
    .then(() => {
      lobbyUnReady = true;
    })
    .catch((error) => {
      console.error(error);
    });
  goOffline(realtime_db);

  if (lobbyUnReady) {
    await socket.emit(`looby_not_ready_to_play`, {
      lobbyID: lobbyID,
    });
  }

  return lobbyUnReady;
};

export const handleListLobbiesReady = async (myUid: any) => {
  const dbRef = ref(realtime_db);
  let lobbies: any = [];
  let otherLobbies: any = [];
  goOnline(realtime_db);

  await get(child(dbRef, `${lobbiesReady}`))
    .then((snapshot) => {
      lobbies = snapshot.val();

      Object.keys(lobbies).forEach(function (item) {
        otherLobbies.push({
          lobbyID: item,
          lobbyName: lobbies[item]?.lobbyName,
          lobbyDetails: lobbies[item],
        });
      });

      return otherLobbies;
    })
    .catch((error) => {
      console.error(error);
    });

  goOffline(realtime_db);

  return otherLobbies;
};

export const setChallengeLobby = async (
  myLobbyID: string,
  lobbyName: string,
  lobbyIDChallenged: string
) => {
  goOnline(realtime_db);
  const dbRef = ref(realtime_db);
  let lobbiesChallended: any;
  let lobbyChallenged: boolean = false;
  console.log(`${lobbiesChallenged}/${lobbyIDChallenged}`);

  try {
    await get(child(dbRef, `${lobbiesChallenged}/${lobbyIDChallenged}`))
      .then((snapshot) => {
        lobbiesChallended = snapshot.val();
        console.log("lobbies: ", lobbiesChallended);
        snapshot.forEach((childSnapshot: any) => {
          console.log("teste: ", childSnapshot.val());
        });
        // Object.keys(lobbies).forEach(function (item) {
        //   otherLobbies.push({
        //     lobbyID: item,
        //     lobbyName: lobbies[item]?.lobbyName,
        //     lobbyDetails: lobbies[item],
        //   });
        // });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }

  // ninguem desafiou ainda essa lobby
  if (!lobbiesChallended) {
    await set(ref(realtime_db, `${lobbiesChallenged}/${lobbyIDChallenged}`), [
      {
        lobbyName: lobbyName,
        lobbyID: myLobbyID,
      },
    ])
      .then(() => {
        lobbyChallenged = true;
        return lobbyChallenged;
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    console.log("ja tem desafios");
  }
  goOffline(realtime_db);

  return lobbyChallenged;
};
