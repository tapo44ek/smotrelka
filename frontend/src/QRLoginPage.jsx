// QRLoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function QRLoginPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const qrUuid = query.get("qr_uuid");
  const [status, setStatus] = useState("pending"); // pending | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!qrUuid) {
      setStatus("error");
      setMessage("QR UUID не указан в ссылке");
      return;
    }

    const approveQr = async () => {
      try {
        setStatus("pending");
        setMessage("Апрув QR... Подождите.");

        const response = await axios.get(
          `${backendUrl}/auth/auth/qr_login/approve?qr_uuid=${encodeURIComponent(qrUuid)}`,
          { withCredentials: true } // важно для куки
        );

        if (response.status === 200) {
          // Если бек вернул токен, можно сохранить
          if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
          }

          setStatus("success");
          setMessage("QR одобрен! Перенаправление...");

          // редирект через короткую паузу, чтобы сообщение успело показаться
          setTimeout(() => navigate("/home"), 500);
        } else {
          setStatus("error");
          setMessage(`Не удалось апрувить QR. Код: ${response.status}`);
        }
      } catch (err) {
        console.error("Ошибка апрува QR:", err);
        setStatus("error");
        setMessage(err.response?.data?.detail || err.message || "Неизвестная ошибка");
      }
    };

    approveQr();
  }, [qrUuid, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      {status === "pending" && (
        <div className="text-center">
          <p className="text-lg font-medium">{message}</p>
          <div className="mt-4 animate-spin border-4 border-gray-300 border-t-black rounded-full w-12 h-12 mx-auto"></div>
        </div>
      )}

      {status === "success" && (
        <div className="text-center text-green-600 font-semibold">{message}</div>
      )}

      {status === "error" && (
        <div className="text-center text-red-600 font-semibold">{message}</div>
      )}
    </div>
  );
}