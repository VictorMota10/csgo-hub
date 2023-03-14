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
  const lobbyID = uuid();

  try {
    goOnline(realtime_db);
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
  let lobbyData: any

  try {
    goOnline(realtime_db);
    await get(child(dbRef, `${lobbies}/${lobbyID}`))
      .then((snapshot) => {
        snapshot.forEach((childSnapshot: any) => {
          lobbyData = childSnapshot.val()
        });
        return lobbyData;
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return lobbyData;
}

export const insertPlayerOnLobby = async (lobbyID: string, playersData: any) => {
  let playerJoin = false

  try {
    goOnline(realtime_db);
    // Cria lobby no banco
    await set(ref(realtime_db, `${lobbies}/${lobbyID}/players`), playersData);
    await socket.emit(`player_join_lobby`, {
      lobbyID: lobbyID,
      playersData
    });

    return playerJoin = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return false;
}

export const closeLobby = async (lobbyID: string) => {
  let closed = false;

  try {
    goOnline(realtime_db);

    await remove(ref(realtime_db, `${lobbies}/${lobbyID}`));
    await socket.emit(`player_closed_lobby`, {
      lobbyID: lobbyID
    });
    closed = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return closed;
}