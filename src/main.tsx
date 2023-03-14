import React from 'react'
import ReactDOM from 'react-dom/client'
import { MainRoutes } from './routes.js'

import './main.scss'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <MainRoutes />
)
