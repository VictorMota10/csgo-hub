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

  try {
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
  } catch (error: any) {
    console.log(error);
  }

  return lobbyData;
};

export const insertPlayerOnLobby = async (
  lobbyID: string,
  playersData: any
) => {
  let playerJoin = false;

  // Insere player na lobby
  await set(ref(realtime_db, `${lobbies}/${lobbyID}/players`), playersData)
    .then(() => {
      socket.emit(`player_join_lobby`, {
        lobbyID: lobbyID,
        playersData,
      });

      return true
    })
    .catch((error) => {
      console.error(error);
    });

  return playerJoin;
};

export const closeLobby = async (lobbyID: string) => {
  goOnline(realtime_db);
  let closed = false;

  try {
    await remove(ref(realtime_db, `${lobbies}/${lobbyID}`));
    socket.emit(`player_closed_lobby`, {
      lobbyID: lobbyID,
    });
    closed = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

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
      socket.emit(`player_leave_lobby`, {
        lobbyID: lobbyID,
      });
      leaved = true;

      return leaved;
    })
    .catch((error) => {
      console.error(error);
    });

  return leaved;
};
