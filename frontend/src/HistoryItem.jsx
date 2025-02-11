import { XCircle } from "lucide-react";

const HistoryItem = ({ movie, onRemove }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-700 rounded max-w-full">
      <button
        className="flex-1 text-left truncate"
        onClick={() => console.log(`Открыть фильм ${movie.data.title}`)}
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