import { XCircle } from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const HistoryItem = ({ movie, setMovieData, onRemove, fetchHistory, darkMode }) => {
  return (
    <div className={`flex justify-between items-center p-2 rounded max-w-full ${darkMode ?  "bg-gray-900 hover:bg-gray-700 text-white" : "bg-zinc-200 hover:bg-zinc-300 text-black"}`}>
<button
  className="flex-1 text-left truncate hover:drop-shadow-2xl"
  onClick={() => {
    setMovieData(movie.data); // ✅ Обновляем состояние плеера

    // 🔥 Отправляем запрос на обновление last_seen
    fetch(`${backendUrl}/auth/history/last_seen`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie.data)
    })
    .then((response) => {

      if (response.status === 401) {
        navigate("/auth"); // Перенаправляем на страницу авторизации
        return Promise.reject("Unauthorized");
    }
    
      if (!response.ok) {
        throw new Error("Ошибка обновления last_seen");
      }
      console.log("✅ last_seen обновлен");
      fetchHistory();
    })
    .catch((error) => console.error("❌ Ошибка:", error));
  }}
>
  {movie.data.title}
</button>
      <button
        className="text-red-400 hover:text-red-600 ml-2"
        onClick={() => onRemove(movie.id)}
      >
        <XCircle size={20} />
      </button>
    </div>
  );
};

export default HistoryItem;