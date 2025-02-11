import { useState } from "react";
import { sendMovieData, extractMovieData } from "./js/MainPageScript";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert("Введите URL для поиска.");
      return;
    }

    setLoading(true);
    try {
      const movieData = await extractMovieData(searchQuery);
      console.log(m)
      if (movieData) {
        await sendMovieData(movieData);
      } else {
        alert("Не удалось извлечь данные из указанного URL.");
      }
    } catch (error) {
      console.error("Ошибка извлечения данных:", error);
      alert("Произошла ошибка при обработке URL.");
    }
    setLoading(false);
    setSearchQuery(""); // Очищаем поле после отправки
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded w-full"
        placeholder="Введите ссылку на фильм..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Загрузка..." : "Поиск"}
      </button>
    </form>
  );
};

export default SearchBar;