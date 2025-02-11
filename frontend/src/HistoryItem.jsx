import { XCircle } from "lucide-react";

const HistoryItem = ({ movie, setMovieData, onRemove, fetchHistory }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-700 rounded max-w-full">
<button
  className="flex-1 text-left truncate"
  onClick={() => {
    setMovieData(movie.data); // ✅ Обновляем состояние плеера

    // 🔥 Отправляем запрос на обновление last_seen
    fetch("http://localhost:8000/auth/history/last_seen", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie.data)
    })
    .then((response) => {
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