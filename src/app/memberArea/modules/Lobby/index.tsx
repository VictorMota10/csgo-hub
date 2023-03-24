import { faCopy, faCrown, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Badge, Button, Col, Input, List, notification, Result, Row, Tag, Tooltip } from 'antd'
import react, { useEffect, useState } from 'react'
import { REACT_APP_URL } from '../../../../utils/urlGlobal'
import { useNavigate, useParams } from "react-router-dom";
import './styles.scss'
import { closeLobby, getLobbyData, handleListLobbiesReady, insertPlayerOnLobby, leaveLobby, setChallengeLobby, setLobbyReady, setLobbyUnReady } from '../../../../firebase-controllers/LobbyController'
import { useUser } from '../../../../context/userContext'
import { auth } from '../../../../infra/firebase'
import { getCookie } from '../../../../utils/getCookies'
import { io } from 'socket.io-client'
import { SOCKET_SERVER_URL } from '../../../../utils/socketGlobals'
import { AntDesignOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'


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
  const [realLobbyPlayers, setRealLobbyPlayers] = useState<any>()
  const [lobbiesReady, setLobbiesReady] = useState([]);

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

  const handleReady = async () => {
    const myLobbyName = `Team ${username || getCookie('username')}`
    const lobbyReady = await setLobbyReady(lobbyID, myLobbyName, realLobbyPlayers)
    if (lobbyReady) {
      setLobbyReadyToPlay(true)
      return
    }
  }

  const handleUnReady = async () => {
    const lobbyUnReady = await setLobbyUnReady(lobbyID)
    if (lobbyUnReady) {
      setLobbyReadyToPlay(false)
      return
    }
  }

  useEffect(() => {
    if (playersLobby) {
      const realPlayers: any = playersLobby?.filter((player: any) => {
        return player?.avatar !== '' && player?.uid
      })
      setRealLobbyPlayers(realPlayers)
    }
  }, [playersLobby])

  const getListLobbiesReady = async () => {
    const listLobbiesReady = await handleListLobbiesReady(auth.currentUser?.uid || getCookie('uid'))
    if (listLobbiesReady?.length > 0) {
      const filteredLobbies = listLobbiesReady?.filter((lobby: any) => lobby?.lobbyID !== lobbyID)
      setLobbiesReady(filteredLobbies)
      console.log(filteredLobbies)
    }
  }

  useEffect(() => {
    if (lobbyReadyToPlay) {
      getListLobbiesReady()
    }
  }, [lobbyReadyToPlay])

  const handleChallenge = async (lobbyName: string, lobbyToChallenge: string) => {
    console.log(lobbyID, lobbyName, lobbyToChallenge)
    const lobbyChallenged = await setChallengeLobby(lobbyID, lobbyName, lobbyToChallenge)
  }

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
            {isCaptain && (
              <div className="ready__area">
                {!lobbyReadyToPlay ?
                  <Button className="ready__play" onClick={() => handleReady()} >
                    Show Lobbies
                  </Button>
                  :
                  <Button className="not__ready__play" onClick={() => handleUnReady()}>
                    Hide Lobbies
                  </Button>
                }
              </div>
            )}
          </article>
          <div className="leave__area">
            <Button className="leave__lobby" onClick={() => { !isCaptain ? handleLeaveLobby() : handleCloseLobby(lobbyID || '') }}>
              <FontAwesomeIcon style={{ transform: 'rotate(180deg)', marginRight: '1rem' }} icon={faSignOutAlt} /> {!isCaptain ? 'Leave lobby' : 'Close lobby'}
            </Button>
          </div>
        </section>
        <section className="lobbys__container">
          {!lobbyReadyToPlay ?
            <Result className="result__lobby"
              title="Your lobby needs to have 5 players and [Show Lobbies] actived to list other lobbies to challenge..."
            /> :
            <>
              <section className="lobbies__ready">
                <Row gutter={[16, 16]} style={{ width: '100%' }}>
                  {lobbiesReady?.map((lobby: any, key: any) => {
                    return (
                        <Col key={key} className="gutter-row" span={6}>
                          <div className='lobby__card'>
                            <h3>{lobby?.lobbyName}</h3>
                            <div className='list__players'>
                              <Avatar.Group>
                                {lobby?.lobbyDetails?.players?.map((player: any, key: any) => {
                                  return (
                                    <>
                                      <Tooltip title={player?.username} placement="top">
                                        <Avatar key={key} size="large" icon={<img src={player?.avatar} /> || <UserOutlined />} />
                                      </Tooltip>
                                    </>
                                  )
                                })}
                              </Avatar.Group>
                            </div>
                            <div className="challenge__container">
                              <Button className='btn__challenge' onClick={(e) => handleChallenge(lobby?.lobbyName, lobby?.lobbyID)}>Challenge</Button>
                            </div>
                          </div>
                        </Col>
                    )
                  })}
                </Row>
              </section>
            </>
          }
        </section>
        <section className="challengers__squads">

        </section>
      </div>
    </>
  )
}