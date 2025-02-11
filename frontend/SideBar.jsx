import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HistoryList from "./HistoryList";

const SideBar = ({ historyOpen, toggleHistory, setMovieData }) => {
  const sidebarRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState("250px"); // Начальное значение

  // 📌 Закрываем SideBar при клике вне него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleHistory(false); // Закрываем SideBar
      }
    };

    if (historyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [historyOpen]);

  // 📌 Обновляем ширину сайдбара при изменении размера окна
  useEffect(() => {
    const updateSidebarWidth = () => {
      const screenWidth = window.innerWidth;
      const calculatedWidth = Math.min(Math.max(screenWidth / 3, 200), 400); // 1/3 экрана, но в пределах 200-400px
      setSidebarWidth(`${calculatedWidth}px`);
    };

    updateSidebarWidth(); // Вызываем при монтировании
    window.addEventListener("resize", updateSidebarWidth);
    return () => window.removeEventListener("resize", updateSidebarWidth);
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-16 bottom-16 left-0 flex transition-all duration-300 z-50 ${
        historyOpen ? `w-[${sidebarWidth}]` : "w-16"
      }`}
      style={{ width: historyOpen ? sidebarWidth : "16px" }}
    >
      {/* Кнопка-шеврон внутри сайдбара */}
      <div
        className="w-4 bg-gray-800 flex items-center justify-center cursor-pointer"
        onClick={() => toggleHistory(!historyOpen)}
      >
        {historyOpen ? (
          <ChevronLeft size={24} className="text-white" />
        ) : (
          <ChevronRight size={24} className="text-white" />
        )}
      </div>

      {/* Контент истории */}
      <div
        className={`h-full bg-gray-900 text-white shadow-lg overflow-hidden transition-all duration-300 ${
          historyOpen ? "p-4" : "p-0"
        }`}
        style={{ width: historyOpen ? sidebarWidth : "0px" }}
      >
        {historyOpen && <HistoryList setMovieData={setMovieData} />}
      </div>
    </div>
  );
};

export default SideBar;