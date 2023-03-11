import React from 'react'
import { Routes, Route, useNavigate, HashRouter } from "react-router-dom";
import { App } from './App';
import { LandingPage } from './app/landingPage';
import { Login } from './app/login';
import { MemberArea } from './app/memberArea';
import { Home } from './app/memberArea/modules/Home';
import { Register } from './app/register';

export const MainRoutes = () => {

  return (<HashRouter>
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
          <Home />
        </MemberArea>
      } />

      <Route path="/member-area/lobby/:id" element={
        <MemberArea>
          <Home />
        </MemberArea>
      } />
    </Routes>
  </HashRouter>)
}