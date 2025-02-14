import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import Cookies from "js-cookie";
import AuthImage from "./AuthImage";
import FooterPage from "./FooterPage";

const AboutPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsAuthenticated(!!token);
  }, []);

  // Переключение темы
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="flex flex-col h-screen"> {/* Глобальный контейнер страницы */}
      
      {/* Основной контент страницы, занимает все доступное пространство */}
      <div className="flex-grow flex flex-col">
        <div
          className={`flex-grow w-full lg:grid lg:grid-cols-2 relative overflow-hidden transition-colors duration-700 ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
          }`}
        >
          {/* Кнопка переключения темы */}
          <button
            className="absolute top-5 right-5 p-2 rounded-full bg-gray-200 z-50"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-gray-700" />
            )}
          </button>

          {/* Левая часть (Форма) */}
          <div
            className={`block1 z-10 flex items-center justify-center py-12 shadow-2xl transition-colors duration-700 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">SMOTRELKA.SPACE</h1>
                <p className="text-grey text-muted-foreground pb-4">
                  Сервис для бесплатного просмотра фильмов и сериалов с
                  кинопоиска.
                </p>
              </div>

              {/* Кнопка входа или перехода на главную */}
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                onClick={() => navigate(isAuthenticated ? "/home" : "/auth")}
              >
                {isAuthenticated ? "На главную" : "Вход/Регистрация"}
              </button>
            </div>
          </div>

          {/* Правая часть (Картинка) */}
          <div>
            <AuthImage />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 z-50 w-full">
        <FooterPage darkMode={darkMode} />
      </div>
      </div>
  );
};

export default AboutPage;