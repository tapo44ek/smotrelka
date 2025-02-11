import React, { useEffect, useState } from "react";
import { init } from "./js/player"; // Функция инициализации плеера


const PlayerComponent = ({ movieData }) => {
    const [playerReady, setPlayerReady] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");
    const [sources, setSources] = useState([]);
  
    useEffect(() => {
      if (movieData) {
        // Запускаем `init()` для плеера
        init(movieData)
          .then((availableSources) => {
            if (availableSources.length > 0) {
              setSources(availableSources); // Сохраняем список источников
              setIframeUrl(availableSources[0].iframeUrl); // Устанавливаем URL первого источника
              setPlayerReady(true);
            } else {
              console.warn("Нет доступных источников.");
            }
          })
          .catch((error) => {
            console.error("Ошибка загрузки плеера:", error);
          });
      }
    }, [movieData]);
  
    return (
      <div id="container" className="relative flex flex-col items-center w-full">
        {/* Окно плеера */}
        <div id="player" className="w-full max-w-4xl bg-gray-900 text-white rounded-lg shadow-lg p-4">
          <div id="header" className="flex justify-between items-center p-4">
            <div id="title" className="text-xl font-bold">{movieData?.title || "Загрузка..."}</div>
            <div id="logo">
              <img src="/assets/logo.svg" alt="Tape Operator Logo" className="h-8" />
            </div>
          </div>
  
          {/* Контент (загрузка или iframe) */}
          <div id="content" className="flex justify-center items-center h-64 bg-gray-800 rounded-lg">
            {playerReady && iframeUrl ? (
              <iframe
                src={iframeUrl}
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            ) : (
              <img src="/assets/loading.svg" alt="Loading..." className="h-12" />
            )}
          </div>
  
          {/* Источники */}
          <div id="sources" className="flex justify-center space-x-4 p-4">
            {sources.map((source, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded-md transition ${
                  iframeUrl === source.iframeUrl
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setIframeUrl(source.iframeUrl)}
              >
                {source.source}
              </button>
            ))}
          </div>
  
          {/* Футер */}
          <div id="footer" className="text-sm text-gray-400 flex justify-between p-2">
            <div>
              Made with ♥ by{" "}
              <a href="https://github.com/Kirlovon" target="_blank" rel="noopener noreferrer" className="text-blue-400">
                Kirlovon
              </a>. Modified by{" "}
              <a href="https://github.com/RichCake/movieservice" target="_blank" rel="noopener noreferrer" className="text-blue-400">
                Movieservice Team
              </a>.
            </div>
            <div>
              <a href="https://github.com/RichCake/movieservice/issues" target="_blank" rel="noopener noreferrer" className="text-blue-400">
                Bug Report ↗
              </a>{" "}
              <span id="version">v3.1.0</span>
            </div>
          </div>
        </div>
  
        {/* Фон */}
        <div id="background" className="absolute inset-0 bg-gray-900 opacity-50 -z-10"></div>
      </div>
    );
  };
  
  export default PlayerComponent;