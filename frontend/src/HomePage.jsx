import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Moon, Sun } from "lucide-react";
import FooterPage from "./FooterPage";
import SideBar from "./SideBar";
import Cookies from "js-cookie";
import TestFetchButton from "./TestFetchButton";
import SearchBar from "./SearchBar";
import PlayerComponent from "./Player";

const HomePage = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState(null); // Изначально null

  // ✅ Функция для загрузки последнего просмотренного фильма
  const fetchLastMovie = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/history/last", {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Ошибка при получении последнего фильма");
      }

      const lastMovie = await response.json();

      if (lastMovie) {
        console.log("📽️ Последний фильм:", lastMovie);
        setMovieData(lastMovie.data); // Устанавливаем данные фильма
      }
    } catch (error) {
      console.error("❌ Ошибка загрузки последнего фильма:", error);
    }
  };

  // 🟢 Запрашиваем последний фильм при загрузке страницы
  useEffect(() => {
    fetchLastMovie();
  }, []);

  // Сохраняем тему в localStorage и применяем ее
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

  return (
    <div className={`w-full lg:grid lg:min-h-screen xl:min-h-screen relative overflow-hidden transition-colors duration-700 ${darkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"}`}>
      {/* ХЭДЕР */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-black text-white shadow-md z-50">
        <h1 className="text-2xl font-bold">SMOTRELKA.SPACE</h1>

        <div className="flex space-x-4">
          {/* Кнопка смены темы */}
          <button
            className="p-2 bg-black rounded-md text-white hover:bg-gray-700 transition"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <Link to="/settings" className="flex items-center space-x-2 hover:opacity-80">
            <User size={24} />
            <span>Настройки</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:opacity-80 bg-red-600 px-4 py-2 rounded-md"
          >
            <LogOut size={24} />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="flex flex-1 mt-20 relative">
        {/* ВСТАВЛЯЕМ Sidebar */}
        <SideBar 
          historyOpen={historyOpen} 
          toggleHistory={() => setHistoryOpen(!historyOpen)} 
          setMovieData={setMovieData} 
          darkMode={darkMode}
        />

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main
          className={`flex-1 p-8 bg-transparent text-gray-800 dark:text-white transition-all duration-300 ${
            historyOpen ? "ml-[33.33vw]" : "ml-0"
          }
          ${darkMode ? " text-white" : "text-black"}
          `}
        >
          <h2 className="text-3xl font-semibold">Добро пожаловать в SMOTRELKA</h2>
          <p className="mt-4">Здесь будут фильмы, подборки и рекомендации.</p>
          <SearchBar setMovieData={setMovieData} />

          {/* ✅ Плеер только если есть данные */}
          {movieData ? <PlayerComponent movieData={movieData} /> : <p>Загрузка плеера...</p>}
        </main>
      </div>

      {/* ФОН ПОД ФУТЕРОМ */}
      <div className="h-16 bg-transparent"></div>

      {/* ФУТЕР */}
      <FooterPage darkMode={darkMode} />
    </div>
  );
};

export default HomePage;