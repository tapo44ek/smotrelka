import React, { useState } from "react";

const TestFetchButton = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/history/add", {
        method: "POST",
        credentials: "include", // Отправка куков вместе с запросом
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResponseData(data);
      console.log("Ответ от сервера:", data);
    } catch (err) {
      setError(err.message);
      console.error("Ошибка запроса:", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleFetch}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Отправить запрос на FastAPI
      </button>
      {responseData && (
        <div className="p-4 bg-green-200 rounded">
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default TestFetchButton;