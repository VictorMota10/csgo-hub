import React from 'react'
import { Header } from '../../components/Header'
import { Button, Carousel, Divider } from 'antd';


import './styles.scss'
import { Players } from '../../components/Players';
import { Events } from '../../components/Events';

export const LandingPage = () => {

  const contentStyle: React.CSSProperties = {
    width: '100%',
    color: '#fff',
    textAlign: 'center',
  };

  return (
    <>
      <Carousel autoplay autoplaySpeed={4000}>
        <div>
          <h3 className='slide__carrousel' style={contentStyle}>
            <div className="img__carrousel img1"></div>
          </h3>
        </div>
        <div>
          <h3 className='slide__carrousel' style={contentStyle}>
            <div className="img__carrousel img2"></div>
          </h3>
        </div>
        <div>
          <h3 className='slide__carrousel' style={contentStyle}>
            <div className="img__carrousel img3"></div>
          </h3>
        </div>
      </Carousel>
      <Header />

      <div className="content__area">
        <section className="section__team">
          <Divider>Team</Divider>
          <Players />
        </section>
        <section className="section__events">
          <Divider>Events</Divider>
          <Events />
        </section>
      </div>
    </>
  )
}