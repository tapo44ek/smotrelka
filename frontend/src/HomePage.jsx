import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Moon, Sun } from "lucide-react";
import FooterPage from "./FooterPage";
import SideBar from "./SideBar";
import Cookies from "js-cookie";
import SearchBar from "./SearchBar";
import PlayerComponent from "./Player";
import AuthImage from "./AuthImage";

const HomePage = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true); // Добавляем состояние загрузки

  const navigate = useNavigate();

  // ✅ Функция для загрузки последнего просмотренного фильма
  const fetchLastMovie = async () => {
    setLoading(true); // Начинаем загрузку
    try {
      const response = await fetch("http://localhost:8000/auth/history/last", {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Ошибка при получении последнего фильма");
      }

      const lastMovie = await response.json();

      if (lastMovie && lastMovie.data) {
        console.log("📽️ Последний фильм:", lastMovie);
        setMovieData(lastMovie.data);
      } else {
        console.warn("📭 Нет данных о последнем фильме.");
        setMovieData({ title: "empty_list" }); // Устанавливаем заглушку
      }
    } catch (error) {
      console.error("❌ Ошибка загрузки последнего фильма:", error);
      setMovieData({ title: "empty_list" }); // Если ошибка — показываем заглушку
    } finally {
      setLoading(false); // Завершаем загрузку
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
    <div className={`z-0 w-full h-screen lg:grid lg:min-h-screen xl:min-h-screen relative overflow-hidden transition-colors duration-700 ${darkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"}`}>
      <div className="absolute inset-0 -z-10">
        <AuthImage />
      </div>

      {/* ХЭДЕР */}
      <header className="fixed top-5 md:top-6 left-1/2 transform -translate-x-1/2 
        w-11/12 md:w-4/5 max-w-5xl px-4 md:px-6 py-3 md:py-4 bg-black text-white 
        shadow-xl rounded-2xl z-50 flex flex-wrap md:flex-nowrap 
        items-center justify-between md:justify-between gap-2 md:gap-4 overflow-hidden">
        
        <h1 className="text-lg md:text-2xl font-bold w-full text-center md:w-auto md:text-left">
          SMOTRELKA.SPACE
        </h1>

        {/* Кнопки справа */}
        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center md:justify-between w-full md:w-auto">
          {/* Кнопка смены темы */}
          <button
            className="p-2 bg-black rounded-md text-white hover:bg-gray-700 transition"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} md:size={24} /> : <Moon size={20} md:size={24} />}
          </button>

          {/* Ссылка на настройки */}
          <Link to="/profile" className="flex items-center space-x-1 md:space-x-2 hover:opacity-80">
            <User size={20} md:size={24} />
            <span className="text-sm md:text-base truncate">Настройки</span>
          </Link>

          {/* Кнопка выхода */}
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 md:space-x-2 hover:opacity-80 bg-red-600 px-3 md:px-4 py-1 md:py-2 rounded-md"
          >
            <LogOut size={20} md:size={24} />
            <span className="text-sm md:text-base truncate">Выйти</span>
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex flex-1 mt-20 relative justify-center">
        {/* ВСТАВЛЯЕМ Sidebar */}
        <SideBar 
          historyOpen={historyOpen} 
          toggleHistory={() => setHistoryOpen(!historyOpen)} 
          setMovieData={setMovieData} 
          darkMode={darkMode}
        />

        <main className="flex-1 w-full mt-10 mx-auto md:max-w-screen-lg p-4 md:p-8 bg-transparent text-gray-800 dark:text-white transition-all duration-300">
          {/* Если идет загрузка, показываем индикатор */}
          {loading ? (
            <p className="text-center text-lg font-semibold text-gray-500">Загрузка...</p>
          ) : (
            <PlayerComponent movieData={movieData} setHistoryOpen={setHistoryOpen} setMovieData={setMovieData} darkMode={darkMode} />
          )}
        </main>
      </div>

      {/* ФОН ПОД ФУТЕРОМ */}
      <div className="h-16 bg-transparent"></div>

      {/* ФУТЕР */}
      <div className="absolute bottom-0 z-50 w-full">
        <FooterPage darkMode={darkMode} />
      </div>
    </div>
  );
};

export default HomePage;