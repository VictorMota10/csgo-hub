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
import { friendInvites, friendList, invitesToPlay, users } from "../utils/databaseNames";
import { getCookie } from "../utils/getCookies";
import { SOCKET_SERVER_URL } from "../utils/socketGlobals";

const socket = io(SOCKET_SERVER_URL);

export const registerPlayer = async (data: any, uid: string) => {
  let userCreated;

  const newPlayer: any = {
    playerData: {
      firstName: data.firstName,
      lastName: data.lastName,
      steamID: data.steamID,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      uid: uid,
    },
  };

  goOnline(realtime_db);
  try {
    await set(ref(realtime_db, `${users}/` + uid), newPlayer);
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
    await get(child(dbRef, `${users}`))
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
    await get(child(dbRef, `${users}`))
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
      player[
        Object.getOwnPropertyNames(player)[index]
      ]?.playerData?.username.includes(username) &&
      player[Object.getOwnPropertyNames(player)[index]]?.playerData
        ?.username !== getCookie("username")
    ) {
      playerSearched =
        player[Object.getOwnPropertyNames(player)[index]]?.playerData;
    }
  });

  return playerSearched;
};

export const inviteFriend = async (uid: string, playerSenderData: any) => {
  let invited = false;
  let alreadyInvited;
  let alreadyFriends;
  goOnline(realtime_db);
  try {
    await get(
      ref(realtime_db, `${friendInvites}/${uid}/${playerSenderData?.uid}`)
    )
      .then((snapshot) => {
        alreadyInvited = snapshot.val();
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  if (!alreadyInvited) {
    try {
      await get(
        ref(realtime_db, `${friendList}/${uid}/${playerSenderData?.uid}`)
      )
        .then((snapshot) => {
          alreadyFriends = snapshot.val();
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error: any) {
      console.log(error);
    }
    if (!alreadyFriends) {
      try {
        goOnline(realtime_db);
        await set(
          ref(realtime_db, `${friendInvites}/${uid}/${playerSenderData?.uid}`),
          playerSenderData
        );
        invited = true;
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  goOffline(realtime_db);

  if (invited) {
    socket.emit(`invite_received`, {
      receivedBy: playerSenderData?.uid,
      sentTo: uid
    });
  }

  return invited;
};

export const getPlayerInvitesFriend = async (uid: string) => {
  let invites: any = [];

  try {
    goOnline(realtime_db);
    await get(ref(realtime_db, `${friendInvites}/${uid}`))
      .then((snapshot) => {
        snapshot.forEach((childSnapshot: any) => {
          invites.push(childSnapshot.val());
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }

  return invites;
};

export const acceptFriendInvite = async (
  uid: string,
  uidFriend: string,
  friendSenderData: any,
  friendAcceptedData: any
) => {
  let addedFriend = false;

  try {
    goOnline(realtime_db);

    // aceitando para o usuario que recebeu
    await set(
      ref(realtime_db, `${friendList}/${uid}/${uidFriend}`),
      friendSenderData
    );

    // setando para usuario que enviou o pedido
    await set(
      ref(realtime_db, `${friendList}/${uidFriend}/${uid}`),
      friendAcceptedData
    );

    await remove(ref(realtime_db, `${friendInvites}/${uid}/${uidFriend}`));
    addedFriend = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return addedFriend;
};

export const declineFriendInvite = async (uid: string, uidFriend: string) => {
  let declined = false;

  try {
    goOnline(realtime_db);

    await remove(ref(realtime_db, `${friendInvites}/${uid}/${uidFriend}`));
    declined = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return declined;
};

export const getFriendList = async (uid: string) => {
  const dbRef = ref(realtime_db);
  let listFriends: any = [];

  try {
    goOnline(realtime_db);
    await get(child(dbRef, `${friendList}/` + uid))
      .then((snapshot) => {
        snapshot.forEach((childSnapshot: any) => {
          listFriends.push(childSnapshot.val());
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return listFriends;
};

export const handleUnfriend = async (uid: string, uidFriend: string) => {
  let unfriend = false;

  try {
    goOnline(realtime_db);
    await remove(ref(realtime_db, `${friendList}/${uid}/${uidFriend}`));
    await remove(ref(realtime_db, `${friendList}/${uidFriend}/${uid}`));
    unfriend = true;
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return unfriend;
};

export const getInvitesPlay = async (uid: string) => {
  const dbRef = ref(realtime_db);
  let listFriends: any = [];

  try {
    goOnline(realtime_db);
    await get(child(dbRef, `${invitesToPlay}/` + uid))
      .then((snapshot) => {
        snapshot.forEach((childSnapshot: any) => {
          listFriends.push(childSnapshot.val());
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error: any) {
    console.log(error);
  }
  goOffline(realtime_db);

  return listFriends;
};
