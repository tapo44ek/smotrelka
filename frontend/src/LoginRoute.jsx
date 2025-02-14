import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const LoginRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = Cookies.get("access_token");
  
    useEffect(() => {
      if (token) {
        navigate("/home", { replace: true });
      }
    }, [token, navigate, location.pathname]); // Добавляем location.pathname
  
    // if (token) {
    //   return null; // Останавливаем рендеринг, пока редирект не сработает
    // }
  
    return children;
  };

export default LoginRoute;