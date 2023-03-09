import react from 'react'
import './styles.scss'
import { players } from '../../assets/players';
import { Avatar } from 'antd';
import SteamLogo from '../../assets/steam-logo.png'


export const Players = () => {

  const openNewTab = (link: string) => {
    window.open(link, '_blank');
  }

  return (
    <>
      <section className='grid__container'>
        {players.map((player: any, key: any) => {
          return (
            <div className='player__container' key={key}>
              <Avatar size={64} icon={<img src={player.avatar} />} />
              <h4>{player.nick}</h4>
              <img className='steam__link' onClick={() => openNewTab(player.steam)} src={SteamLogo} />

              <span>{player.name} {player.lastName}</span>
            </div>
          )
        })}
      </section>
    </>
  )
}