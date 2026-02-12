import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthImage from "./AuthImage";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Moon, Sun } from "lucide-react"; // Иконки
import FooterPage from "./FooterPage";
import ResetPasswordModal from "./ResetPasswordModal"; 
import CookieConsent from "./CookieConsent";

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isResetOpen, setIsResetOpen] = useState(false); 

  // При загрузке проверяем тему в localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
<div className={`min-h-screen flex flex-col transition-colors duration-700 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
  {/* Контейнер основной страницы */}
  <div className="flex-1 w-full lg:grid lg:grid-cols-2 xl:min-h-screen relative overflow-hidden">
    
    {/* Кнопка переключения темы */}
    <button
      className="absolute top-5 right-5 p-2 rounded-full bg-gray-200 z-50 hidden lg:block"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-700" />}
    </button>

    {/* ✅ МОБИЛЬНАЯ ВЕРСИЯ */}
    <div className="lg:hidden relative h-screen flex flex-col  justify-center min-h-screen w-full px-6 overflow-hidden">
      {/* 🔥 Картинка-фон */}
      <div className="absolute inset-0 -z-10 flex justify-center items-center opacity-20">
        <AuthImage />
      </div>

      {/* 📌 Контейнер формы */}
      <div className="relative z-10 bg-transparent p-6 -top-16 rounded-xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center">
          {isRegistering ? "Регистрация" : "Вход"}
        </h1>
        <p className="text-gray-500 text-center mb-4">
          {isRegistering ? "Создайте аккаунт" : "Введите данные для входа"}
        </p>

        {/* 🔹 Форма */}
        {isRegistering ? (
          <RegisterForm key="register" />
        ) : (
          <LoginForm key="login" darkMode={darkMode} />
        )}

        {/* 🔹 Кнопка переключения */}
        <button
          className="mt-4 w-full border border-gray-300 dark:border-gray-600 
            bg-gray-100 dark:bg-gray-700 text-black dark:text-white 
            hover:bg-gray-200 dark:hover:bg-gray-600 transition 
            rounded-lg px-4 py-2"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Назад ко входу" : "Регистрация"}
        </button>
      </div>
    </div>

    {/* 🖥️ Десктопная версия */}
    <motion.div
      className={`block1 z-10 flex min-h-screen items-center justify-center py-12 shadow-2xl transition-colors duration-700 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      animate={{ x: isRegistering ? "0%" : "100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">
            {isRegistering ? "С подключением!" : "Добро пожаловать"}
          </h1>
          <p className="text-grey text-muted-foreground pb-4">
            {isRegistering ? "Введите данные для регистрации" : "Введите данные для входа"}
          </p>
          {isRegistering ? <RegisterForm /> : <LoginForm  darkMode={darkMode}/>}
        </div>
        {/* <button
                onClick={() => setIsResetOpen(true)}
                className="text-blue-500 hover:text-blue-700 text-sm mt-2 block text-center"
              >
                Забыли пароль?
              </button> */}
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Назад к входу" : "Регистрация"}
        </button>
      </div>
    </motion.div>

    {/* Правая часть (Картинка) */}
    <motion.div
      className={`block2 hidden overflow-hidden bg-gradient-to-br lg:block absolute top-0 left-0 w-full h-full lg:w-1/2 transition-colors duration-700 ${darkMode ? "from-gray-700 via-gray-800 to-black" : "from-slate-200 via-gray-50 to-stone-200"}`}
      animate={{ x: isRegistering ? "100%" : "0%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <AuthImage />
    </motion.div>
  </div>

  {/* ✅ Футер (закреплен внизу) */}
  <div className="absolute bottom-0 z-50 w-full">
  <CookieConsent />
  <FooterPage darkMode={darkMode} className="mt-auto"/>
  </div>
        {/* ✅ Подключаем модальное окно */}
        <ResetPasswordModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
</div>
  );
};

export default AuthPage;