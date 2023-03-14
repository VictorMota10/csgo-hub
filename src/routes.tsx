import React from 'react'
import { Routes, Route, useNavigate, HashRouter } from "react-router-dom";
import { App } from './App';
import { LandingPage } from './app/landingPage';
import { Login } from './app/login';
import { MemberArea } from './app/memberArea';
import { Friends } from './app/memberArea/modules/Friends';
import { Invites } from './app/memberArea/modules/Friends/Invites';
import { ListFriends } from './app/memberArea/modules/Friends/ListFriends';
import { Home } from './app/memberArea/modules/Home';
import { InvitesPlay } from './app/memberArea/modules/InvitesPlay';
import { Lobby } from './app/memberArea/modules/Lobby';
import { Register } from './app/register';
import { UserProvider } from './context/userContext';

export const MainRoutes = () => {

  return (
    <UserProvider>
      <HashRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PRIVATE ROUTES */}

          <Route path="/member-area/home" element={
            <MemberArea>
              <Home />
            </MemberArea>
          } />

          <Route path="/member-area/friends" element={
            <MemberArea>
              <Friends />
            </MemberArea>
          } />

          <Route path="/member-area/invites" element={
            <MemberArea>
              <Invites />
            </MemberArea>
          } />

          <Route path="/member-area/list-friends" element={
            <MemberArea>
              <ListFriends />
            </MemberArea>
          } />

          <Route path="/member-area/invites-play" element={
            <MemberArea>
              <InvitesPlay />
            </MemberArea>
          } />

          <Route path="/member-area/lobby/:id" element={
            <MemberArea>
              <Lobby />
            </MemberArea>
          } />
        </Routes>
      </HashRouter>
    </UserProvider>)
}