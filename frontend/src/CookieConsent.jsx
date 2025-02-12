import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  // Проверяем, соглашался ли пользователь ранее
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  // Функция для принятия куков
  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 animate-fade-in">
      <p className="text-sm text-gray-300">
        Мы используем файлы cookies для улучшения работы сайта. Подробности в{" "}
        <a href="/policy" className="underline text-blue-400 hover:text-blue-500">
          Политике конфиденциальности
        </a>.
      </p>
      <button
        onClick={acceptCookies}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white text-sm font-medium transition"
      >
        Принять
      </button>
    </div>
  );
};

export default CookieConsent;