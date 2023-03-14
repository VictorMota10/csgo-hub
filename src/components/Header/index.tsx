import react from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.scss'

import EaglesLogo from '../../assets/Logo.png'
import { Button } from 'antd'

export const Header = () => {
  const navigate = useNavigate()

  const goToTeam = () => {
    navigate('/')

    const teamElement = document.getElementById("team") as HTMLDivElement
    setTimeout(() => {
      teamElement.scrollIntoView({ block: 'end',  behavior: 'smooth' })
    }, 500)
    
  }

  const goToEvents = () => {
    navigate('/')

    const teamElement = document.getElementById("events") as HTMLDivElement
    setTimeout(() => {
      teamElement.scrollIntoView({ block: 'end',  behavior: 'smooth' })
    }, 500)
    
  }

  return (
    <>
      <div className="header__container">
        <section className='header__options'>
          <section className='header__options--logo'>
            <img onClick={() => navigate('/')} src={EaglesLogo} />
          </section>
          <section className="area__links">
            <div className="area__first">
              <a className="header__link" onClick={() => navigate('/')}>Home</a>
              <a className="header__link" onClick={() => goToEvents()}>Events</a>
              <a className="header__link"  onClick={() => goToTeam()}>Team</a>
            </div>
            <div className="area__account">
              <Button onClick={() => navigate('/login')} type="primary">Sign In</Button>
              <Button onClick={() => navigate('/register')}>Sign Up</Button>
            </div>
          </section>
        </section>
      </div>
    </>
  )
}