import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import AuthPage from './AuthPage.jsx';
import AboutPage from './AboutPage.jsx';
import HomePage from './HomePage.jsx';
import PrivateRoute from "./PrivateRoute";
import LoginRoute from './LoginRoute';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginRoute><AuthPage /></LoginRoute>} />
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/" element={<AboutPage />} />
        
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
