import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';
import AuthPage from './AuthPage.jsx';
import AboutPage from './AboutPage.jsx';
import HomePage from './HomePage.jsx';
import PrivateRoute from "./PrivateRoute";
import LoginRoute from './LoginRoute';
import PrivacyPolicy from './PrivacyPage.jsx';
import CookieConsent from "./CookieConsent";
import ProfilePage from './ProfilePage.jsx';





createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginRoute><AuthPage /></LoginRoute>} />
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/" element={<AboutPage />} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
