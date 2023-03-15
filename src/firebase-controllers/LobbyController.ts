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
import { lobbies } from "../utils/databaseNames";
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
};

export const checkPlayerAlreadyInLobby = async (uidPlayer: string) => {
  const dbRef = ref(realtime_db);
  let lobbiesData: any;
  let lobbyIDAlreadyExists: string = "";
  let alreadyExists: boolean = false;

  await get(child(dbRef, `${lobbies}`))
    .then((snapshot) => {
      lobbiesData = snapshot.val();
    })
    .catch((error) => {
      console.error(error);
    });

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

  // Insere player na lobby
  await set(ref(realtime_db, `${lobbies}/${lobbyID}/players`), playersData)
    .then(() => {
      playerJoin = true;
    })
    .catch((error) => {
      console.error(error);
    });

  if (playerJoin) {
    socket.emit(`player_join_lobby`, {
      lobbyID: lobbyID,
      playersData,
    });
  }

  if(playersData?.length === 5){
    socket.emit(`looby_ready_to_play`, {
      lobbyID: lobbyID,
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
