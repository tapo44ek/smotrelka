import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HistoryList from "./HistoryList";

const SideBar = ({ historyOpen, toggleHistory, setMovieData }) => {
  const sidebarRef = useRef(null);

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
  }, [historyOpen]); // ✅ Следим за `historyOpen`

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-16 bottom-16 left-0 flex transition-all duration-300 z-50 ${
        historyOpen ? "w-64" : "w-16"
      }`}
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
          historyOpen ? "w-60 p-4" : "w-0 p-0"
        }`}
      >
        {historyOpen && <HistoryList setMovieData={setMovieData} />}
      </div>
    </div>
  );
};

export default SideBar;