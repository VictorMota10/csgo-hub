import { Button, Col, notification, Row, Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react'

import './styles.scss'

import { useForm, FormProvider } from 'react-hook-form'
import { Input } from '../../components/Input';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../infra/firebase';
import { getPlayerById } from '../../firebase-controllers/UserController';
import { Header } from '../../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { getSteamData } from '../../firebase-controllers/SteamController';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Login = () => {
  const { username, setUsername, steamID, setSteamID, avatar, setAvatar, email, setEmail, uidCurrent, setUidCurrent } = useUser();

  const [loadingLogin, setLoadingLogin] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const [api, contextHolder] = notification.useNotification();

  const methods = useForm();
  const {
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = methods;

  const handleLogin = async (data: any) => {
    setLoadingLogin(true)
    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential: any) => {
        await handleUserDataCookies(userCredential.user)
        navigate('/member-area/home')
      })
      .catch((error) => {
        const errorFirebase = error.code;
        getMessageError(errorFirebase)
      });
    setLoadingLogin(false)
  }

  const handleUserDataCookies = async (userData: any) => {
    const playerData: any = await getPlayerById(auth.currentUser?.uid || '')
    const steamData: any = await getSteamData(playerData.playerData?.steamID)

    setUsername(playerData.playerData?.username)
    setEmail(userData.email)
    setSteamID(playerData.playerData?.steamID)
    setUidCurrent(auth.currentUser?.uid)
    setAvatar(steamData?.steamResponse?.avatar)

    document.cookie = `accessToken=${userData.accessToken}`
    document.cookie = `email=${userData.email}`
    document.cookie = `steamID=${playerData.playerData?.steamID}`
    document.cookie = `username=${playerData.playerData?.username}`
    document.cookie = `avatar=${steamData.steamResponse?.avatar}`
  }

  const getMessageError = (errorText: string) => {
    if (errorText === 'auth/user-not-found') {
      openNotification('error', 'Error', 'User not found.')
    }

    if (errorText === 'auth/invalid-email') {
      openNotification('error', 'Error', 'Invalid E-mail.')
    }

    if (errorText === 'auth/wrong-password') {
      openNotification('error', 'Error', 'Invalid Credentials.')
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
      <div className="bg__game">

        <Header />
        <div className="content__area--login">
          {contextHolder}
          <FormProvider {...methods}>
            <form autoComplete="off" className="form__container" onSubmit={handleSubmit(handleLogin)}>

              <div className='text__area'>
                <h4>START FOR FREE</h4>

                <h1>Sign in and let's play!</h1>

                <p>Forgot your password? <a>Click here</a></p>
              </div>

              <Space className='space__login' direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={24}>
                    <Input
                      name="email"
                      label="Email"
                      labelColor='var(--text-white)'
                      required
                      type="email"
                      maxLength={100}
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
                  <Col span={24}>
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
                    />
                  </Col>
                </Row>

                <Row style={{ width: '100%' }} gutter={32}>
                  <Col span={24}>
                    <Button loading={loadingLogin} htmlType='submit' className='btn__create' type="primary">Login</Button>
                  </Col>
                </Row>
              </Space>

            </form>
          </FormProvider>
        </div>
      </div>
    </>
  )
}