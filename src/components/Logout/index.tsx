import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'antd'
import react, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './styles.scss'

export const Logout = () => {
  const navigate = useNavigate()
  const [count, setCount] = useState(3)

  useEffect(() => {
    if(count === 0){
      navigate('/login')
    }
    count > 0 && setTimeout(() => setCount(count - 1), 1000);
  }, [count])

  return (
    <>
      <div className="bg__game--logout">
        <Modal
          className='modal__redirect--login'
          title="Você não está autenticado..."
          centered
          open={true}
          footer={null}
          closable={false}
        >
          <p>Você precisa logar novamente para acessar area de membros.</p>
          <FontAwesomeIcon className="lock__icon" icon={faLock} />

          <h4>Redirecionando em {count}</h4>
        </Modal>
      </div>
    </>
  )
}