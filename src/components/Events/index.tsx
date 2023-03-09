import { Badge, Card, Space } from 'antd'
import react from 'react'
import { Countdown } from '../Countdown'
import './styles.scss'
import { QRCode } from 'antd';

export const Events = () => {
  const deadline = new Date("Mar 18, 2023 09:00:00").getTime()

  return (
    <>
      <div className='events__container'>
        <section className='left__container'>
          <article className="main-event__container">
            <h3>Lanzinha Ressaca do Carnaval</h3>
            <p>Este evento é uma ótima oportunidade para você se reunir, socializar e competir em um ambiente divertido e descontraído. O evento acontece em uma grande lan house, com computadores alinhados em mesas ao redor da sala. A decoração é temática, com pôsteres de jogos e personagens de videogames espalhados pelas paredes. A música alta e animada toca ao fundo, criando uma atmosfera de energia e entusiasmo. Nosso proximo evento está marcado para:</p>
            <Countdown deadline={deadline}/>
            <h3>Save the data in Google Calendar</h3>
            <QRCode value="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MHJxdTVxaG5tdXViOWw0OGVxM2NxZWZvdjQgdGhlY3JhenllbGV0cm9uaWNAbQ&tmsrc=thecrazyeletronic%40gmail.com" />
          </article>
        </section>
        <section className='right__container'>
          <Space style={{ flexDirection: 'column' }} size="middle">
            <Badge.Ribbon text="24/06/EVERY_YEAR">
              <Card style={{ width: '100% !important' }} title="Lanzinha da Massa" size="small">
                Com muita animação, diversão e surpresas, este será um dia inesquecível para todos os participantes. O evento contará com diversas atividades para pessoas de todas as idades, desde jogos eletrônicos a atividades físicas e desafios que testarão suas habilidades e criatividade.
              </Card>
            </Badge.Ribbon>
            <Badge.Ribbon text="28/10/EVERY_YEAR">
              <Card style={{ width: '100% !important' }} title="Hallowen na LAN" size="small">
                A Lanzinha de Halloween sobrevivencialista pode ser assustadora e emocionante ao mesmo tempo, criando uma atmosfera única que transporta os participantes para um mundo de terror e suspense. As atividades são voltadas para a sobrevivência em um mundo pós-apocalíptico, onde os participantes devem enfrentar desafios e superar obstáculos para sobreviver.
              </Card>
            </Badge.Ribbon>
            <Badge.Ribbon text="25/12/EVERY_YEAR">
              <Card style={{ width: '100% !important' }} title="Natal online" size="small">
                O evento de natal é uma celebração especial que traz alegria e confraternização para todos os participantes. Por isso, com muita animação, diversão e surpresas, anunciamos nossa lãzinha da massa de fim de ano! Para fazer aquele fechamento com categoria. Muito tabuleiro, HS e cerveja!
              </Card>
            </Badge.Ribbon>
          </Space>
        </section>
      </div>
    </>
  )
}