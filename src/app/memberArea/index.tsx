import './styles.scss'
import React, { useEffect, useState } from 'react'

import { faHomeAlt, faLock, faSignOutAlt, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Breadcrumb, Layout, Menu } from 'antd';
import { Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';

import { useNavigate } from 'react-router-dom';
import { Logout } from '../../components/Logout';

import LogoEagles from '../../assets/Logo.png'


export const MemberArea = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate()
  const [goToLogOut, setGoToLogOut] = useState(false)
  const [collapsed, setCollapsed] = useState(false);

  function parseJwt(token: string) {
    if (token === '') {
      return null;
    }
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  const verify = async (token: string) => {
    const decoded = parseJwt(token)
    if (!decoded) {
      logOut()
    } else {
      signInOk()
    }
  }

  const logOut = () => {
    setGoToLogOut(true)
  }

  const signInOk = () => {
    setGoToLogOut(false)
  }

  useEffect(() => {
    const token = getCookie('accessToken')
    verify(token || '')
  }, [])

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts?.pop()?.split(';').shift();
  }

  return (
    <>
      {goToLogOut ?
        <Logout />
        :
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="area__logo">
              <img src={LogoEagles} className="logo__menu" />
            </div>
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
              <Menu.Item
                key="home"
                onClick={() => navigate("/member-area/home")}
                icon={
                  <FontAwesomeIcon icon={faHomeAlt} />
                }
              >
                <span>Home</span>
              </Menu.Item>
              <Menu.Item
                key="friends"
                onClick={() => navigate("/member-area/friends")}
                icon={
                  <FontAwesomeIcon icon={faUserFriends} />
                }
              >
                <span>Friend's</span>
              </Menu.Item>
              <Menu.Item
                key="logout"
                onClick={() => navigate("/login")}
                icon={
                  <FontAwesomeIcon icon={faSignOutAlt} />
                }
              >
                <span>Sign out</span>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout className="site-layout">
            <Content style={{ backgroundColor: 'var(--blue-input)', padding: '2%' }}>
              {children}
            </Content>
          </Layout>
        </Layout>

      }
    </>
  )
}