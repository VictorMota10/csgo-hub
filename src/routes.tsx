import React from 'react'
import { Routes, Route, useNavigate, HashRouter } from "react-router-dom";
import { App } from './App';
import { LandingPage } from './app/landingPage';
import { Login } from './app/login';
import { MemberAreaHome } from './app/memberArea';
import { Register } from './app/register';

export const MainRoutes = () => {

  return (<HashRouter>
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PRIVATE ROUTES */}
      <Route path="/member-area/home" element={<App>
        <MemberAreaHome />
      </App>} />
    </Routes>
  </HashRouter>)
}