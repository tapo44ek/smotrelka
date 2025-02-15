import { useState, useEffect, useRef } from "react";
import HistoryItem from "./HistoryItem";
import { useNavigate } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const HistoryList = ({ setMovieData, darkMode }) => {
  const [history, setHistory] = useState([]);
  const [maxHeight, setMaxHeight] = useState("500px"); // Начальное значение

  const historyRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
    updateMaxHeight(); // Вычисляем высоту при монтировании

    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/history/hist`, {
        credentials: "include",
        method: "GET",
      });

      if (response.status === 401) {
        navigate("/auth"); // Перенаправляем на страницу авторизации
        return Promise.reject("Unauthorized");
    }


      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
    }
  };

  const deleteMovie = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/auth/history/remove`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.status === 401) {
        navigate("/auth"); // Перенаправляем на страницу авторизации
        return Promise.reject("Unauthorized");
    }

      if (response.ok) {
        setHistory((prevHistory) => prevHistory.filter((movie) => movie.id !== id));
      } else {
        console.error("Ошибка при удалении фильма:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка сети при удалении:", error);
    }
  };

  // Функция для вычисления динамической высоты истории
  const updateMaxHeight = () => {
    const headerHeight = document.querySelector("header")?.offsetHeight || 0;
    const footerHeight = document.querySelector("footer")?.offsetHeight || 0;
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - headerHeight - footerHeight - 32; // Отступы
    setMaxHeight(`${calculatedHeight}px`);
  };

  return (
    <div
      ref={historyRef}
      className={`overflow-y-scroll z-50 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-2 rounded 
        ${darkMode ?  "bg-gray-800 text-white" : "bg-white text-black"}`}
      style={{ maxHeight }} // Устанавливаем динамическую высоту
    >
      
      {history.length === 0 ? (
        <p className="text-gray-400">История пуста</p>
      ) : (
        <div className="space-y-2">
          {history.map((movie) => (
            <HistoryItem
              key={movie.id}
              movie={movie}
              setMovieData={setMovieData}
              onRemove={deleteMovie}
              fetchHistory={fetchHistory}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;