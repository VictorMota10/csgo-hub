import { faCopy, faCrown, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Badge, Button, Input, List, notification, Result, Tag } from 'antd'
import react, { useEffect, useState } from 'react'
import { REACT_APP_URL } from '../../../../utils/urlGlobal'
import { useNavigate, useParams } from "react-router-dom";
import './styles.scss'
import { closeLobby, getLobbyData, insertPlayerOnLobby, leaveLobby } from '../../../../firebase-controllers/LobbyController'
import { useUser } from '../../../../context/userContext'
import { auth } from '../../../../infra/firebase'
import { getCookie } from '../../../../utils/getCookies'
import { io } from 'socket.io-client'
import { SOCKET_SERVER_URL } from '../../../../utils/socketGlobals'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'


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
  const [lobbyReadyToPlay, setLobbyReadyToPlay] = useState(false)

  const handleCopy = () => {
    const inputLink = document.getElementById('link__lobby') as HTMLInputElement
    navigator.clipboard.writeText(inputLink.value);
  }

  //EVENTS SOCKET

  // novo player entra na sala
  socket.on("player_join_lobby_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      handleGetUpdateLobby(lobbyID)
    }
  });

  socket.on("player_closed_lobby_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      openNotification('info', 'Info', 'This lobby has just closed...');
      setTimeout(() => {
        navigate('/member-area/home')
      }, 2000)
    }
  });

  socket.on("player_leave_lobby_front", async (data: any) => {
    if (data.lobbyID === lobbyID) {
      await handleGetUpdateLobby(lobbyID)
    }
  });

  socket.on("looby_ready_to_play_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      setLobbyReadyToPlay(true)
    }
  });

  socket.on("looby_not_ready_to_play_front", (data: any) => {
    if (data.lobbyID === lobbyID) {
      setLobbyReadyToPlay(false)
    }
  });

  const handleGetUpdateLobby = async (lobbyID: string) => {
    setLoadingPlayersLobby(true)
    let emptyPlayer = {
      avatar: ''
    }
    let arrayPlayers: any = []
    let emptyArrayPlayers: any = []
    const lobbyPlayers = await getLobbyData(lobbyID)
    arrayPlayers = lobbyPlayers

    arrayPlayers?.forEach((player: any) => {
      if (player?.uid === auth.currentUser?.uid && player?.isCaptain) {
        setIsCaptain(true)
      }
    });

    for (let index = 5; lobbyPlayers.length < index; index--) {
      emptyArrayPlayers.push(emptyPlayer)
    }
    emptyArrayPlayers?.forEach((element: any) => {
      arrayPlayers.push(element)
    });
    setPlayersLobby(arrayPlayers)
    setLoadingPlayersLobby(false)
  }

  const handleGetLobbyData = async (lobbyID: string) => {
    setLoadingPlayersLobby(true)

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

        const inserted = await insertPlayerOnLobby(lobbyID, arrayIncrementNewPlayer)
        if (inserted) {
          setLoadingPlayersLobby(false)
          setPlayersLobby(arrayIncrementNewPlayer)
        }
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

  const handleLeaveLobby = async () => {
    const uidRemove = auth.currentUser?.uid || getCookie('uid') || ''

    const leaved = await leaveLobby(playersLobby, lobbyID, uidRemove)
    if (leaved) {
      navigate('/member-area/home')
    }
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
          <div className="head__lobby--text">
            <h3>Lobby</h3>
            {lobbyReadyToPlay ?
              <Tag className='tag__lobby' icon={<CheckCircleOutlined />} color="success">
                Ready
              </Tag> : <Tag className='tag__lobby' icon={<ClockCircleOutlined />} color="warning">
                Waiting players
              </Tag>}
          </div>
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
                    avatar={
                      item?.isCaptain ?
                        <Badge count={<FontAwesomeIcon icon={faCrown} />}>
                          <Avatar src={item?.avatar || <FontAwesomeIcon icon={faUserAlt} style={{ color: '#FFB800 !important' }} />} />
                        </Badge> :
                        <Avatar src={item?.avatar || <FontAwesomeIcon icon={faUserAlt} />} />
                    }
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
              <Button className="leave__lobby" onClick={() => { !isCaptain ? handleLeaveLobby() : handleCloseLobby(lobbyID || '') }}>
                <FontAwesomeIcon style={{ transform: 'rotate(180deg)', marginRight: '1rem' }} icon={faSignOutAlt} /> {!isCaptain ? 'Leave lobby' : 'Close lobby'}
              </Button>
            </div>
          </article>
        </section>
        <section className="lobbys__container">
          {!lobbyReadyToPlay ?
            <Result className="result__lobby"
              title="Your lobby needs to have 5 players to list other lobbies to challenge..."
            /> : 'LISTA LOBBIES'}
        </section>
      </div>
    </>
  )
}