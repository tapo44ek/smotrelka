import React, { useEffect, useState } from "react";
import HistoryItem from "./HistoryItem";

const HistoryList = () => {
  const [history, setHistory] = useState([]);

  // 📌 Запрос истории с сервера
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/history/hist", {
        credentials: "include",
        method: "GET", // ✅ Передаём куки
      });
      const data = await response.json();
      setHistory(data); // Обновляем состояние
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
    }
  };

// 📌 Удаление фильма
const deleteMovie = async (id) => {
    try {
      const response = await fetch("http://localhost:8000/auth/history/remove", {
        method: "POST",  // ✅ Изменили на POST
        credentials: "include",
        headers: {
          "Content-Type": "application/json",  // ✅ Указываем JSON
        },
        body: JSON.stringify({ id: id }),  // ✅ Отправляем JSON с id
      });
  
      if (response.ok) {
        setHistory((prevHistory) => prevHistory.filter((movie) => movie.id !== id));
      } else {
        console.error("Ошибка при удалении фильма:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка сети при удалении:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white w-full">
      <h2 className="text-xl font-semibold mb-4">📜 История просмотров</h2>
      {history.length === 0 ? (
        <p className="text-gray-400">История пуста</p>
      ) : (
        <div className="space-y-2 max-w-full">
          {history.map((movie) => (
            <HistoryItem key={movie.id} movie={movie} onRemove={deleteMovie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;