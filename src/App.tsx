import React, { useEffect, useState } from 'react'
import uuid from 'react-uuid';

import io from 'socket.io-client'

import './styles.scss'

const socket = io('http://localhost:8080')
socket.on('connect', () => console.log("[IO] Connect => New Connection"))

export const App = ({ children }: { children: JSX.Element }) => {
  // useEffect(() => {
  //   socket.on('test.event', handleNewUser)
  //   socket.off('test.event', handleNewUser)
  // }, [])

  // const emitEvent = async () => {
  //   const userData = {
  //     user: username,
  //     age: age,
  //     steamID: steamID
  //   }
  //   socket.emit('test.event', {
  //     id: myId,
  //     userData
  //   })
  // }

  function parseJwt(token: string) {
    console.log(token)
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  const verify = async (token: string) => {
    const decoded = parseJwt(token)
    console.log(new Date(decoded.exp*1000))
    
    console.log(new Date(decoded.auth_time*1000))

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
      {children}
    </>
  )
}
