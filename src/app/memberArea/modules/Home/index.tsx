import { LoadingOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Row, Space, notification, Alert, } from 'antd'
import react, { useEffect, useState } from 'react'
import './styles.scss'

import LogoCSGO from '../../../../assets/logo_csgo.png'
import axios from 'axios'
import { GET_STATS_STEAM_PLAYER, TRN_STEAM_API } from '../../../../service/config-http'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faGun } from '@fortawesome/free-solid-svg-icons'
import { getCookie } from '../../../../utils/getCookies'

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Home = () => {
  const [playerSteamID, setPlayerSteamID] = useState('')
  const [playerStats, setPlayerStats] = useState<any>()
  const [mapsStats, setMapsStats] = useState<any>()
  const [statsDestructured, setStatsDestructured] = useState<any>()
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingWeaponStats, setLoadingWeaponStats] = useState(false)
  const [privateProfileSteam, setPrivateProfileSteam] = useState(false)

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    setPlayerSteamID(getCookie('steamID') || '')
  }, [])

  useEffect(() => {
    if (playerSteamID) {
      getSteamStats()
      getSteamStatsMap()
    }

  }, [playerSteamID])

  const getSteamStats = async () => {

    if (localStorage.getItem('steamStats')) {
      setLoadingStats(true)
      setPlayerStats(JSON.parse(localStorage.getItem('steamStats') || ''));
      setStatsDestructured(JSON.parse(localStorage.getItem('steamStats') || '')?.segments[0]?.stats)
      setTimeout(() => {
        setLoadingStats(false)
      }, 500)
      return

    } else {

      await axios(`${GET_STATS_STEAM_PLAYER}${playerSteamID}`)
        .then(function (response) {
          if (response.data.status === 429) {
            openNotification('error', 'Ops!', 'Too many requests..., wait 1 minute to try again.')
          }

          if (response.data.status === 400) {
            setPrivateProfileSteam(true)
            setLoadingStats(false)
          } else {
            localStorage.setItem('steamStats', JSON.stringify(response?.data?.data))
            setPlayerStats(response?.data?.data);
            setStatsDestructured(response?.data?.data?.segments[0]?.stats)
          }
          setLoadingStats(false)
        })
        .catch(function (error) {
          console.log(error.status);
          setLoadingStats(false)
          openNotification('error', 'Ops!', 'Error on fetching the stats of player.')
        });
    }
  }

  const getSteamStatsMap = async () => {
    setLoadingWeaponStats(true)
    playerSteamID

    if (localStorage.getItem('steamMapsStats')) {
      setLoadingWeaponStats(true)
      setMapsStats(JSON.parse(localStorage.getItem('steamMapsStats') || ''));
      setTimeout(() => {
        setLoadingWeaponStats(false)
      }, 500)
      return

    } else {
      await axios(`${GET_STATS_STEAM_PLAYER}map/${playerSteamID}`)
        .then(function (response) {

          if (response.data.status === 403) {
            setPrivateProfileSteam(true)
          } else {
            localStorage.setItem('steamMapsStats', JSON.stringify(response?.data?.playerstats))
            setMapsStats(response?.data?.playerstats);
          }

          setLoadingWeaponStats(false)
        })
        .catch(function (error) {
          console.error(error.status);
          setLoadingWeaponStats(false)
          openNotification('error', 'Ops!', 'Error on fetching the stats of player.')
        });
    }


  }

  const openNotification = (type: NotificationType, title: string, message: string) => {
    api[type]({
      message: title,
      description: message,
    });
  };

  return (
    <>
      {contextHolder}
      <div className='content__area--home'>
        <div className='header__home'>
          <section className="player__info">
            <div className="player__avatar">
              <Avatar size="large" icon={playerStats?.platformInfo ? <img src={playerStats?.platformInfo?.avatarUrl} /> : <UserOutlined />} />
            </div>
            <h3>{playerStats?.platformInfo?.platformUserHandle}</h3>
          </section>
          <section className="middle_area">
            <img src={LogoCSGO} className="logo_csgo" />
          </section>
          <section className="play__area">
            <Button className='btn__success create__squad'>Create Group</Button>
          </section>
        </div>

        {privateProfileSteam &&
          <Alert
            message="Error fetching steam data..."
            description="Confirm that your steam is public so we can fetch your player data."
            type="error"
            showIcon
          />
        }


        <div className='overview__container'>
          <div className='overview__head'>
            <h2>Overview Stats <span>(steam)</span> <ReloadOutlined id="reload" onClick={() => {
              getSteamStats();
              const reloadIcon = document.getElementById('reload') as HTMLDivElement
              reloadIcon.classList.add('rotate')
              setTimeout(() => {
                reloadIcon.classList.remove('rotate')
              }, 1000)

            }} /></h2>
            <h3><FontAwesomeIcon icon={faClock} /> Time played: {statsDestructured?.timePlayed?.displayValue}</h3>
          </div>

          <section className="stats__container">
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Row justify="space-between">
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>Rounds Played<span> - ({statsDestructured?.matchesPlayed?.displayCategory}) </span></h4>
                    {loadingStats ? <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} /> : <h1>{statsDestructured?.matchesPlayed?.displayValue}</h1>}

                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.kd?.displayName}<span> - ({statsDestructured?.kd?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: statsDestructured?.kd?.displayValue > 1 ? 'var(--green-light)' : 'var(--red-light)' }}>
                        {statsDestructured?.kd?.displayValue}
                      </h1>}
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.headshotPct?.displayName}<span> - ({statsDestructured?.headshotPct?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: statsDestructured?.headshotPct?.displayValue > 50 ? 'var(--green-light)' : 'var(--red-light)' }}>{statsDestructured?.headshotPct?.displayValue}</h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.mvp?.displayName}<span> - ({statsDestructured?.mvp?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1>{statsDestructured?.mvp?.displayValue}</h1>
                    }
                  </div>
                </Col>
              </Row>
              <Row justify="space-between">
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.roundsWon?.displayName}<span> - ({statsDestructured?.roundsWon?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: 'var(--green-light)' }}>{statsDestructured?.roundsWon?.displayValue}</h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>Rounds Losses<span> - ({statsDestructured?.losses?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: 'var(--red-light)' }}>{statsDestructured?.losses?.displayValue}</h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.kills?.displayName}<span> - ({statsDestructured?.kills?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: 'var(--green-light)' }}>{statsDestructured?.kills?.displayValue}</h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <h4>{statsDestructured?.deaths?.displayName}<span> - ({statsDestructured?.deaths?.displayCategory}) </span></h4>
                    {loadingStats ?
                      <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                      :
                      <h1 style={{ color: 'var(--red-light)' }}>{statsDestructured?.deaths?.displayValue}</h1>
                    }
                  </div>
                </Col>
              </Row>
            </Space>
          </section>

          <div className='overview__head--weapon'>
            <h2>Weapons Stats <FontAwesomeIcon icon={faGun} /> <ReloadOutlined id="reload--weapon" onClick={() => {
              getSteamStatsMap()
              const reloadIcon = document.getElementById('reload--weapon') as HTMLDivElement
              reloadIcon.classList.add('rotate')
              setTimeout(() => {
                reloadIcon.classList.remove('rotate')
              }, 1000)
            }} /></h2>
          </div>

          <section className="stats__container--weapon">
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Row justify="space-between">
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <div className='box__head'>
                      <h4>Kills - AK-47</h4>
                    </div>
                    {
                      loadingWeaponStats ?
                        <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                        :
                        <h1>
                          {mapsStats?.stats?.filter((stat: any) => stat.name === 'total_kills_ak47')[0]?.value}
                        </h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <div className='box__head'>
                      <h4>Kills - AWP</h4>
                    </div>
                    {
                      loadingWeaponStats ?
                        <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                        :
                        <h1>
                          {mapsStats?.stats?.filter((stat: any) => stat.name === 'total_kills_awp')[0]?.value}
                        </h1>
                    }
                  </div>
                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <div className='box__head'>
                      <h4>Kills - M4A1</h4>
                    </div>
                    {
                      loadingWeaponStats ?
                        <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                        :
                        <h1>
                          {mapsStats?.stats?.filter((stat: any) => stat.name === 'total_kills_m4a1')[0]?.value}
                        </h1>
                    }
                  </div>

                </Col>
                <Col span={6} className="column__stats">
                  <div className="box__stat">
                    <div className='box__head'>
                      <h4>Kills - Desert Eagle</h4>
                    </div>
                    {
                      loadingWeaponStats ?
                        <LoadingOutlined style={{ fontSize: '2rem', marginTop: '1rem' }} />
                        :
                        <h1>
                          {mapsStats?.stats?.filter((stat: any) => stat.name === 'total_kills_deagle')[0]?.value}
                        </h1>
                    }
                  </div>
                </Col>
              </Row>
            </Space>
          </section>

        </div>
      </div>
    </>
  )
}