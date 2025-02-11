import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HistoryList from "./HistoryList";

const SideBar = ({ historyOpen, toggleHistory, setMovieData, darkMode }) => {
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
      className={`fixed top-18 bottom-16 left-0 flex transition-all drop-shadow-2xl duration-300 z-50 rounded ${
        historyOpen ? "w-1/3 min-w-[250px]" : "w-0"
      }`}
    >
      {/* Кнопка-шеврон внутри сайдбара */}
      <div
        className={`w-8 flex items-center justify-center cursor-pointer ${darkMode ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black"}`}
        onClick={() => toggleHistory(!historyOpen)}
      >
        {historyOpen ? (
          <ChevronLeft size={24} className={`${darkMode ? "text-white" : "text-black"}`} />
        ) : (
          <ChevronRight size={24} className={`${darkMode ? "text-white" : "text-black"}`} />
        )}
      </div>

      {/* Контент истории */}
      
      <div
        className={`h-full shadow-lg overflow-hidden transition-all duration-300 ${
          historyOpen ? "w-full p-4" : "w-0 p-0"
        }
        ${darkMode ? "bg-gray-800 text-white" : "bg-zinc-100 text-black"}`}
      >
        <ul>
        <h2 className="text-lg font-semibold mb-2">📜 История просмотров</h2>
        </ul>
        <ul>{historyOpen && <HistoryList setMovieData={setMovieData} darkMode={darkMode}/>}</ul>
        {/* {historyOpen && <HistoryList setMovieData={setMovieData} />} */}
      </div>
    </div>
  );
};

export default SideBar;