import React, { useRef, useEffect } from "react";
import { XCircle, Clock } from "lucide-react";
import HistoryList from "./HistoryList";

const SideBar = ({ historyOpen, toggleHistory, setMovieData, darkMode }) => {
  const modalRef = useRef(null);

  // 📌 Закрываем модальное окно при клике вне него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        toggleHistory(false); // Закрываем модалку
      }
    };

    if (historyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [historyOpen]); // ✅ Следим за `historyOpen`

  return (
    <>
{/* 📌 Затемнение фона */}
{historyOpen && (
  <div 
    className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 z-[99] pointer-events-none" 
    onClick={() => toggleHistory(false)} 
  />
)}

{/* 📌 Всплывающее окно истории */}
<div
  ref={modalRef}
  className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
  w-11/12 max-w-lg p-6 rounded-2xl shadow-2xl transition-all duration-300 z-[100]
  ${historyOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}
  ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
      >
        {/* Заголовок + Кнопка закрытия */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📜 История просмотров</h2>
          <button onClick={() => toggleHistory(false)} className="text-red-500 hover:text-red-700">
            <XCircle size={24} />
          </button>
        </div>

        {/* Контент истории */}
        {historyOpen && <HistoryList setMovieData={setMovieData} darkMode={darkMode} />}
      </div>

      {/* 📌 Кнопка открытия (левый верхний угол) */}
      {/* {!historyOpen && (
        <button
          onClick={() => toggleHistory(true)}
          className="fixed top-6 left-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition z-50"
        >
          <Clock size={24} />
        </button>
      )} */}
    </>
  );
};

export default SideBar;