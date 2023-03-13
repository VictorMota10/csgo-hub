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
import { getCookie } from '../../utils/getCookies';


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

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    localStorage.clear();
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
              <Menu.SubMenu
                key="friends"
                icon={<FontAwesomeIcon icon={faUserFriends} />}
                title="Friends"
              >
                <Menu.Item
                  key="add-friends"
                  onClick={() => navigate("/member-area/friends")}
                >
                  <span>Add Friends</span>
                </Menu.Item>
                <Menu.Item
                  key="list-invites"
                  onClick={() => navigate("/member-area/invites")}
                >
                  <span>Your Invites</span>
                </Menu.Item>
                <Menu.Item
                  key="list-friends"
                  onClick={() => navigate("/member-area/list-friends")}
                >
                  <span>List friends</span>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item
                key="logout"
                onClick={() => { navigate("/login"); deleteAllCookies() }}
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