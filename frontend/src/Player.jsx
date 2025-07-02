import React, { useEffect, useState } from "react";
import { init } from "./js/player";
import { Clock } from "lucide-react";
import SearchBar from "./SearchBar";

const PlayerComponent = ({ movieData, setHistoryOpen, setMovieData, darkMode }) => {
    const [playerReady, setPlayerReady] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");
    const [sources, setSources] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false); // Флаг для проверки пустого списка

    useEffect(() => {
        if (!movieData || !movieData.title || movieData.title === "empty_list") {
            setIsEmpty(true);
            setPlayerReady(false);
            return;
        }

        setIsEmpty(false);
        init(movieData)
            .then((availableSources) => {
                if (availableSources.length > 0) {
                    setSources(availableSources);
                    setIframeUrl(availableSources[0].iframeUrl);
                    setPlayerReady(true);
                } else {
                    console.warn("Нет доступных источников.");
                    setPlayerReady(false);
                }
            })
            .catch((error) => {
                console.error("Ошибка загрузки плеера:", error);
                setPlayerReady(false);
            });
    }, [movieData]);

    return (
        <div 
            id="container" 
            className=" grid w-full items-center justify-center w-full max-w-[95vw] mx-auto px-2 md:px-4 overflow-hidden"
        >
            {/* 🔹 Контейнер для кнопок истории и поиска */}
            <div className="relative w-full max-w-screen-sm md:max-w-screen-md lg:max-w-2xl flex justify-between items-center px-2 py-1">
                {/* 📌 Кнопка Истории */}
                <button
                    onClick={() => setHistoryOpen(true)}
                    className="px-4 py-2 bg-black text-white rounded-md shadow-md hover:bg-gray-300 transition text-sm md:text-base"
                >
                    История
                </button>

                {/* 🔍 Поисковая строка */}
                <div className="w-full max-w-xs md:max-w-md">
                    <SearchBar setMovieData={setMovieData} darkMode={darkMode} />
                </div>
            </div>

            {/* 📌 Окно плеера */}
            <div 
                id="vibix_union" 
                className={`w-full h-auto max-w-screen-sm md:max-w-screen-md lg:max-w-2xl min-w-[300px] drop-shadow-xl items-center transition-all duration-600
                 rounded-lg shadow-lg p-2 ${darkMode ? "bg-zinc-900 text-white" : "bg-zinc-300 text-black"}`}
            >
                {/* 🔹 Заголовок */}
                <div id="header" className="flex justify-between items-center p-2">
                    <div id="title" className="text-sm md:text-lg font-bold truncate">
                        {isEmpty ? "Тут пока пусто" : movieData?.title}
                    </div>
                </div>

                {/* 🔹 Контент */}
                <div 
                    id="content" 
                    className="grid grid-cols-1 justify-center items-center rounded-lg w-full h-[40vh] min-h-[200px] md:aspect-[16/9]"
                >
                    {isEmpty ? (
                        <p className="text-lg font-semibold text-gray-500">Тут пока пусто</p>
                    ) : playerReady && iframeUrl ? (
                        <iframe
                            src={iframeUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            className="w-full h-full rounded-lg"
                        ></iframe>
                    ) : (
                        <p className="text-lg font-semibold text-gray-500">Загрузка...</p>
                    )}
                </div>

                {/* 🔹 Источники */}
                {playerReady && sources.length > 0 && (
                    <div id="sources" className="flex flex-wrap justify-center items-center gap-1 p-2">
                        {sources.map((source, index) => (
                            <button
                                key={index}
                                className={`px-2 py-1 text-xs md:text-sm rounded-md transition ${
                                    iframeUrl === source.iframeUrl
                                        ? "bg-black text-white"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                                onClick={() => setIframeUrl(source.iframeUrl)}
                            >
                                {source.source}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerComponent;