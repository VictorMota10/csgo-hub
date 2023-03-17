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
import { lobbies, lobbiesReady } from "../utils/databaseNames";
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

  return lobbyData;
  goOffline(realtime_db);
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

export const setLobbyReady = async (lobbyID: string, playersData: any) => {
  let lobbyReady = false;

  // Insere player na lobby
  await set(ref(realtime_db, `${lobbiesReady}/${lobbyID}/players`), playersData)
    .then(() => {
      lobbyReady = true;
    })
    .catch((error) => {
      console.error(error);
    });

  if (lobbyReady) {
    await socket.emit(`looby_ready_to_play`, {
      lobbyID: lobbyID,
    });
  }

  return lobbyReady;
};

export const setLobbyUnReady = async (lobbyID: string) => {
  let lobbyUnReady = false;

  // Insere player na lobby
  await remove(ref(realtime_db, `${lobbiesReady}/${lobbyID}`))
    .then(() => {
      lobbyUnReady = true;
    })
    .catch((error) => {
      console.error(error);
    });

  if (lobbyUnReady) {
    await socket.emit(`looby_not_ready_to_play`, {
      lobbyID: lobbyID,
    });
  }

  return lobbyUnReady;
};
