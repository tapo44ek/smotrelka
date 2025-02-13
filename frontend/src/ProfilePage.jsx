import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut, Moon, Sun } from "lucide-react";
import FooterPage from "./FooterPage";
import AuthImage from "./AuthImage";
import Cookies from "js-cookie";


const backendUrl = import.meta.env.VITE_BACKEND_URL;


const ProfilePage = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Сохранение темы
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Функция выхода
  const handleLogout = () => {
    Cookies.remove("access_token");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Обработчик смены пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ Пароли не совпадают!");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/auth/change_password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Пароль успешно изменен!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(`❌ Ошибка: ${data.detail || "Попробуйте снова"}`);
      }
    } catch (error) {
      setMessage("❌ Ошибка сервера, попробуйте позже.");
    }
  };

  return (
    <div className={`z-0 w-full h-screen lg:grid lg:min-h-screen xl:min-h-screen relative overflow-hidden transition-colors duration-700 ${darkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"}`}>
      <div className="absolute inset-0 -z-10">
        <AuthImage />
      </div>

      {/* ХЭДЕР */}
      <header className="fixed top-5 md:top-6 left-1/2 transform -translate-x-1/2 
        w-11/12 md:w-4/5 max-w-5xl px-4 md:px-6 py-3 md:py-4 bg-black text-white 
        shadow-xl rounded-2xl z-50 flex flex-wrap md:flex-nowrap 
        items-center justify-between gap-2 md:gap-4 overflow-hidden">
        
        <h1 className="text-lg md:text-2xl font-bold w-full text-center md:w-auto md:text-left">
          Профиль
        </h1>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Кнопка смены темы */}
          <button
            className="p-2 bg-black rounded-md text-white hover:bg-gray-700 transition"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Кнопка Домой */}
          <Link to="/home" className="flex items-center space-x-1 hover:opacity-80 bg-blue-600 px-3 py-2 rounded-md">
            <Home size={20} />
            <span className="text-sm">Домой</span>
          </Link>

          {/* Кнопка выхода */}
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:opacity-80 bg-red-600 px-3 py-2 rounded-md"
          >
            <LogOut size={20} />
            <span className="text-sm">Выйти</span>
          </button>
        </div>
      </header>

      {/* Форма смены пароля */}
      <div className="flex flex-1 mt-20 justify-center items-center">
        <div className={` p-6 rounded-xl shadow-2xl w-full max-w-md ${darkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"}`}>
          <h2 className="text-2xl font-bold text-center">Смена пароля</h2>

          {message && <p className="mt-3 text-center font-semibold">{message}</p>}

          <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium">Текущий пароль</label>
              <input 
                type="password" 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Новый пароль</label>
              <input 
                type="password" 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Повторите новый пароль</label>
              <input 
                type="password" 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Сменить пароль
            </button>
          </form>
        </div>
      </div>

      {/* ФУТЕР */}
      <div className="absolute bottom-0 w-full">
        <FooterPage darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ProfilePage;