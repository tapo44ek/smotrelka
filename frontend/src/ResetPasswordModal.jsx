import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ResetPasswordModal = ({ isOpen, onClose, darkMode }) => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        const formData = new FormData();
        formData.append("email", email);
      const response = await fetch(`${backendUrl}/auth/auth/reset_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        setError("Ошибка: попробуйте позже.");
      }
    } catch (error) {
      setError("Ошибка сети. Попробуйте еще раз.");
    }
  };

  if (!isOpen) return null; // Не рендерим, если окно закрыто

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
        {/* Заголовок */}
        <h2 className="text-lg font-semibold mb-4">
          {isSent ? "Новый пароль отправлен" : "Сброс пароля"}
        </h2>

        {/* Если пароль уже отправлен – показываем кнопку "ОК" */}
        {isSent ? (
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
          >
            ОК
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Введите e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 w-full"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
            >
              Отправить
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;