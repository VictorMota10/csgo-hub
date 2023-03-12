import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../infra/firebase'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../../components/Input';
import { Button, Col, Row, Space, Tooltip, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { checkUserDataUniqueAlreadyExists, deletePlayerById, getPlayerById } from '../../firebase-controllers/UserController';
import { getSteamData } from '../../firebase-controllers/SteamController';
import './styles.scss'
import { Header } from '../../components/Header';
import { InfoCircleOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser } from '@fortawesome/free-regular-svg-icons';
import { faGamepad, faKey } from '@fortawesome/free-solid-svg-icons';
import { faSteam } from '@fortawesome/free-brands-svg-icons';
import { registerPlayer } from '../../firebase-controllers/PlayerController';
import { yupResolver } from "@hookform/resolvers/yup";
import { validations } from './utils/validations';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Register = () => {
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [errorRegister, setErrorRegister] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate()
  const methods = useForm({
    resolver: yupResolver(validations)
  });
  const {
    control,
    reset,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = methods;

  const getMessageError = (errorText: string) => {
    if (errorText === 'auth/invalid-email') {
      setErrorRegister(true)
      setErrorMessage('Email inválido!')
    }
    if (errorText === 'auth/wrong-password') {
      setErrorRegister(true)
      setErrorMessage('Senha inválida!')
    }
    if (errorText === 'auth/email-already-in-use') {
      setErrorRegister(true)
      setErrorMessage('Email já cadastrado!')
    }
  }

  const handleCreateUser = async (data: any) => {
    setLoadingRegister(true)
    const userDataArrayExists: Array<any> = await checkUserDataUniqueAlreadyExists(data)

    if (userDataArrayExists.length > 0) {
      userDataArrayExists.forEach((field: any) => {
        setError(field, { type: 'custom', message: `${field} já cadastrado.` })
      })
    } else {
      const steamInfo: any = await getSteamData(data.steamID)

      if (steamInfo.steamResponse) {
        await createUserWithEmailAndPassword(auth, data.email, data.password)
          .then((userCredential) => {
            const user = userCredential.user;
            setTimeout(() => {
              navigate('/login')
            }, 2000)

            openNotification('success', 'Sucesso!', 'Usuário criado com sucesso.',)
          })
          .catch((error) => {
            getMessageError(error.code)
            openNotification('error', 'Error', errorMessage)
          });

        if (auth.currentUser?.email) {
          data.avatar = steamInfo?.steamResponse?.avatar
          const playerCreated = await registerPlayer(data, auth.currentUser?.uid)
          if (!playerCreated) {
            openNotification('error', 'Error', 'Houve um erro ao cadastrar player.')
            auth.currentUser?.delete()
          }
        }
      } else {
        openNotification('error', 'Error', 'SteamID inválido!')
      }
    }
    setLoadingRegister(false)
  }

  const openNotification = (type: NotificationType, title: string, message: string,) => {
    api[type]({
      message: title,
      description: message,
    });
  };

  return (
    <>
      <div className="bg__game">

        <Header />
        <div className="content__area--register">
          {contextHolder}
          <FormProvider {...methods}>
            <form autoComplete="off" className="form__container" onSubmit={handleSubmit(handleCreateUser)}>

              <div className='text__area'>
                <h4>START FOR FREE</h4>

                <h1>Create new account.</h1>

                <p>Already A Member? <a>Sign In</a></p>
              </div>

              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={12}>
                    <Input
                      name="firstName"
                      label="First Name"
                      labelColor='var(--text-white)'
                      required
                      type="text"
                      maxLength={60}
                      placeholder="First Name..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faUser} />}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      name="lastName"
                      label="Last Name"
                      labelColor='var(--text-white)'
                      required
                      type="text"
                      maxLength={60}
                      placeholder="Last Name..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faUser} />}
                    />
                  </Col>
                </Row>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={12}>
                    <Input
                      name="username"
                      label="Username"
                      labelColor='var(--text-white)'
                      required
                      type="text"
                      maxLength={60}
                      placeholder="Username..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faGamepad} />}
                      suffix={
                        <Tooltip title="Username must be unique">
                          <InfoCircleOutlined style={{ color: 'rgba(255,255,255,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      name="steamID"
                      label="SteamID"
                      labelColor='var(--text-white)'
                      required
                      type="text"
                      maxLength={60}
                      placeholder="SteamID..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faSteam} />}
                      suffix={
                        <Tooltip title="Inform your SteamID64">
                          <InfoCircleOutlined style={{ color: 'rgba(255,255,255,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Col>
                </Row>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={24}>
                    <Input
                      name="email"
                      label="Email"
                      labelColor='var(--text-white)'
                      required
                      type="email"
                      maxLength={60}
                      placeholder="Type your email..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faEnvelope} />}
                      suffix={
                        <Tooltip title="Email must be unique">
                          <InfoCircleOutlined style={{ color: 'rgba(255,255,255,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Col>
                </Row>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={12}>
                    <Input
                      name="password"
                      label="Password"
                      labelColor='var(--text-white)'
                      required
                      type="password"
                      minLength={6}
                      maxLength={40}
                      placeholder="Type your passord..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faKey} />}
                      suffix={
                        <Tooltip title="Password must have at least: 1 Uppercase letter, 1 Lowercase letter, 1 number and 8 characters.">
                          <InfoCircleOutlined style={{ color: 'rgba(255,255,255,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      name="confirmPassword"
                      label="Confirm Password"
                      labelColor='var(--text-white)'
                      required
                      type="password"
                      minLength={6}
                      maxLength={40}
                      placeholder="Type your passord..."
                      autoComplete="off"
                      prefix={<FontAwesomeIcon icon={faKey} />}
                    />
                  </Col>
                </Row>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={24}>
                    <Button htmlType='submit' className='btn__create' type="primary">Create account</Button>
                  </Col>
                </Row>
                {errorRegister && <span className="error__register">{errorMessage || 'Houve um erro ao fazer login'}</span>}
              </Space>

            </form>
          </FormProvider>
        </div>
      </div>
    </>
  )
}