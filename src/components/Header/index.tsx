import react from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.scss'

import EaglesLogo from '../../assets/Logo.png'
import { Button } from 'antd'

export const Header = () => {
  const navigate = useNavigate()

  return (
    <>
      <div className="header__container">
        <section className='header__options'>
          <section className='header__options--logo'>
            <img onClick={() => navigate('/')} src={EaglesLogo} />
          </section>
          <section className="area__links">
            <div className="area__first">
              <a className="header__link" onClick={() => navigate('/home')}>Home</a>
              <a className="header__link" onClick={() => navigate('/events')}>Events</a>
              <a className="header__link" onClick={() => navigate('/contact')}>Contact</a>
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