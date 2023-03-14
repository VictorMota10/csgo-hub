import { faCopy, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Button, Input, List, notification } from 'antd'
import react, { useEffect, useState } from 'react'
import { REACT_APP_URL } from '../../../../utils/urlGlobal'
import { useNavigate, useParams } from "react-router-dom";
import './styles.scss'
import { closeLobby, getLobbyData, insertPlayerOnLobby } from '../../../../firebase-controllers/LobbyController'
import { useUser } from '../../../../context/userContext'
import { auth } from '../../../../infra/firebase'
import { getCookie } from '../../../../utils/getCookies'
import { io } from 'socket.io-client'
import { SOCKET_SERVER_URL } from '../../../../utils/socketGlobals'


type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Lobby = () => {
  const socket = io(SOCKET_SERVER_URL)
  const [api, contextHolder] = notification.useNotification();

  const { username, setUsername, uidCurrent, avatar } = useUser();
  const { id } = useParams()

  const navigate = useNavigate()

  const [lobbyID, setLobbyID] = useState('')
  const [playersLobby, setPlayersLobby] = useState<any>()
  const [loadingPlayersLobby, setLoadingPlayersLobby] = useState(false)
  const [isCaptain, setIsCaptain] = useState(false)

  const handleCopy = () => {
    const inputLink = document.getElementById('link__lobby') as HTMLInputElement
    navigator.clipboard.writeText(inputLink.value);
  }

  //EVENTS SOCKET

  // novo player entra na sala
  socket.on("player_join_lobby_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      handleGetLobbyData(lobbyID)
    }
  });

  socket.on("player_closed_lobby_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      openNotification('error', 'Error', 'This lobby has just closed...');
      setTimeout(() => {
        navigate('/member-area/home')
      }, 2000)
    }
  });

  const handleGetLobbyData = async (lobbyID: string) => {
    let playerAlreadyExistsInLobby = false
    let emptyPlayer = {
      avatar: ''
    }
    let arrayPlayers: any = []
    let emptyArrayPlayers: any = []

    const lobbyPlayers = await getLobbyData(lobbyID)
    arrayPlayers = lobbyPlayers

    //Verificando se o usuario ja está na lobby
    arrayPlayers?.forEach((player: any) => {
      if (player?.uid === auth.currentUser?.uid) {
        playerAlreadyExistsInLobby = true
      }
      if (player?.uid === auth.currentUser?.uid && player?.isCaptain) {
        setIsCaptain(true)
      }
    });

    // insere player na lobby e dispara eventos para atualizar os outros players da lobby
    if (!playerAlreadyExistsInLobby) {
      if (lobbyPlayers.length < 5) {
        let arrayIncrementNewPlayer: any = []
        const newPlayer = {
          uid: auth.currentUser?.uid,
          isCaptain: false,
          username: username || getCookie('username'),
          avatar: avatar || getCookie('avatar')
        }

        lobbyPlayers?.forEach((player: any) => {
          arrayIncrementNewPlayer.push(player)
        });
        arrayIncrementNewPlayer.push(newPlayer)

        await insertPlayerOnLobby(lobbyID, arrayIncrementNewPlayer)
        setLoadingPlayersLobby(false)
      } else {
        openNotification('error', 'Error', 'This lobby already have max limit of players');
        setTimeout(() => {
          navigate('/member-area/home')
        }, 3000)
      }
    } else {
      for (let index = 5; lobbyPlayers.length < index; index--) {
        emptyArrayPlayers.push(emptyPlayer)
      }
      emptyArrayPlayers?.forEach((element: any) => {
        arrayPlayers.push(element)
      });
      setPlayersLobby(arrayPlayers)
    }

    setLoadingPlayersLobby(false)
  }

  const handleLeaveLobby = async (uidRemove: string) => {

  }

  const handleCloseLobby = async (lobbyID: string) => {
    const closed = await closeLobby(lobbyID)
    if (closed) {
      navigate('/member-area/home')
      openNotification('info', 'Info', 'Lobby closed!');
    }

  }

  useEffect(() => {
    let lobbyid = id?.replace('id=', '') || ''
    setLobbyID(lobbyid)
  }, [id])

  useEffect(() => {
    if (lobbyID !== '') {
      setLoadingPlayersLobby(true)
      handleGetLobbyData(lobbyID)
      setLoadingPlayersLobby(false)
    }
  }, [lobbyID])

  const openNotification = (type: NotificationType, title: string, message: string) => {
    api[type]({
      message: title,
      description: message,
      duration: 3
    });
  };

  return (
    <>
      {contextHolder}
      <div className="container__lobby">
        <section className="players__squad">
          <h3>Your Lobby</h3>
          <article className="squad">
            <List
              loading={loadingPlayersLobby}
              className="demo-loadmore-list"
              itemLayout="horizontal"
              dataSource={playersLobby}
              renderItem={(item: any, index) => (
                <List.Item>
                  <List.Item.Meta
                    key={index}
                    avatar={<Avatar src={item?.avatar || <FontAwesomeIcon icon={faUserAlt} />} style={{ border: item?.isCaptain ? '2px solid #FFB800' : 'none' }} />}
                    title={item?.username || ''}
                  />
                </List.Item>
              )}
            />
            <div className='clipboard__link'>
              <Input id="link__lobby" value={`${REACT_APP_URL}/member-area/lobby/id=${lobbyID}`} />
              <Button onClick={() => handleCopy()}><FontAwesomeIcon icon={faCopy} /></Button>
            </div>
            <div className="leave__area">
              <Button className="leave__lobby" onClick={() => { !isCaptain ? handleLeaveLobby(auth.currentUser?.uid || '') : handleCloseLobby(lobbyID || '') }}>
                <FontAwesomeIcon style={{ transform: 'rotate(180deg)', marginRight: '1rem' }} icon={faSignOutAlt} /> {!isCaptain ? 'Leave lobby' : 'Close lobby'}
              </Button>
            </div>
          </article>
        </section>
        <section className="lobbys__container">oa</section>
      </div>
    </>
  )
}