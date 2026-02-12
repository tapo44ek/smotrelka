import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// QRLoginModal.jsx
// Полная логика создания QR для входа, отображения QR и поллинга статуса.
// Поведение:
// 1) При открытии модалки POST -> ${backendUrl}/auth/auth/qr_login/create
// 2) При 200: взять response.data.uid -> сформировать ссылку approve
// 3) Рисовать QR со ссылкой approve
// 4) Каждую секунду GET -> ${backendUrl}/auth/auth/qr_login/check_approve?qr_uuid={uid}
// 5) Когда придёт 200 с response.data.status === "approve"|"approved" — редирект на #/home
// Дополнительно: при обновлении QR (пересоздании) и/или при закрытии модалки
// отправляем DELETE -> /auth/auth/qr_login/delete?qr_uuid={uid}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function QRLoginModal({ isOpen, onClose, darkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const pollRef = useRef(null);
  const uidRef = useRef(null); // чтобы можно было удалять uid из любых колбеков
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    // блокируем скролл
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // создаём QR с сервера
    createQr();

    return () => {
      document.body.style.overflow = originalOverflow;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Удаляет QR на сервере (если uid передан), игнорирует ошибки
  const deleteQr = async (qrUid) => {
    if (!qrUid) return;
    try {
      await axios.delete(`${backendUrl}/auth/auth/qr_login/delete?qr_uuid=${encodeURIComponent(qrUid)}`, {
        withCredentials: true,
      });
    } catch (err) {
      // логируем, но не мешаем пользователю
      console.debug("QR delete error (ignored):", err.response?.status, err.response?.data || err.message);
    }
  };

  // Очистка: остановка поллинга + удаление QR на сервере + сброс локального состояния
  const cleanup = async () => {
    clearPoll();
    const current = uidRef.current;
    if (current) {
      await deleteQr(current);
    }
    uidRef.current = null;
    setUid(null);
    setQrUrl(null);
    setLoading(false);
    setError(null);
  };

  const createQr = async () => {
    setLoading(true);
    setError(null);

    try {
      // если уже был uid — удаляем его перед созданием нового
      if (uidRef.current) {
        await deleteQr(uidRef.current);
      }

      const resp = await axios.post(
        `${backendUrl}/auth/auth/qr_login/create`,
        {},
        { withCredentials: true }
      );

      if (resp.status === 200 && resp.data && resp.data.uid) {
        const newUid = resp.data.uid;
        setUid(newUid);
        uidRef.current = newUid;
        const url = `https://smotrelka.space/qr_login?qr_uuid=${encodeURIComponent(newUid)}`;
        setQrUrl(url);
        // стартуем поллинг
        startPoll(newUid);
      } else {
        setError("Неправильный ответ от сервера при создании QR");
      }
    } catch (err) {
      setError("Ошибка при создании QR: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const startPoll = (qrUid) => {
    clearPoll();
    pollRef.current = setInterval(async () => {
      try {
        const r = await axios.get(
          `${backendUrl}/auth/auth/qr_login/check_approve?qr_uuid=${encodeURIComponent(qrUid)}`,
          { withCredentials: true }
        );

        // DEBUG: логируем тело ответа, чтобы точно видеть структуру
        console.debug("QR check response:", r.status, r.data);

        const status =
          (r.data && (r.data.status || (r.data.body && r.data.body.status))) || null;

        if (r.status === 200 && status && typeof status === "string") {
          const normalized = status.toLowerCase();
          if (normalized === "approve" || normalized === "approved") {
            clearPoll();
            // опционально сохраняем токен, если сервер его присылает
            const token = r.data?.token || r.data?.body?.token;
            if (token) {
              localStorage.setItem("token", token);
            }
            // удаляем QR на сервере (чтобы избежать висящих сессий)
            try {
              await deleteQr(qrUid);
            } catch (e) {
              console.debug("Ошибка при удалении QR после approve (ignored):", e);
            }
            uidRef.current = null;
            // редиректим на хеш #/home как попросили
            window.location.hash = "#/home";
            return;
          }
        }
        // Иначе — продолжаем поллинг
      } catch (err) {
        if (err.response) {
          console.debug("QR check error response:", err.response.status, err.response.data);
        } else {
          console.error("QR check network error:", err);
        }
        // продолжаем поллинг
      }
    }, 1000);
  };

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={async () => { await cleanup(); onClose(); }} />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Войти по QR</h3>
            <p className="mt-1 text-sm text-gray-600">Отсканируйте QR-код камерой для подтверждения входа</p>
          </div>
          <button onClick={async () => { await cleanup(); onClose(); }} aria-label="Закрыть модал" className="rounded-full p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </header>

        <main className="grid gap-4">
          {loading && <p className="text-sm">Создаём QR... Пожалуйста, подождите.</p>}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && qrUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <QRCode value={qrUrl} size={192} />
              </div>

              {/* <div className="text-sm text-gray-600 break-words text-center">
                <div>UID: <span className="font-mono">{uid}</span></div>
                <div className="mt-1">Ссылка: <a className="underline" href={qrUrl} target="_blank" rel="noreferrer">Открыть</a></div>
              </div> */}

              {/* <div className="text-xs text-gray-500">Ожидание подтверждения... (проверка каждую секунду)</div> */}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    // вручную пересоздать QR: удаляем старый и создаём новый
                    clearPoll();
                    const old = uidRef.current;
                    if (old) await deleteQr(old);
                    await createQr();
                  }}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Обновить QR
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await cleanup();
                    onClose();
                  }}
                  className="rounded-md px-3 py-2 text-sm"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {!loading && !qrUrl && !error && (
            <div className="text-sm text-gray-600">Ничего не найдено — попробуйте обновить.</div>
          )}
        </main>

      </div>
    </div>
  );
}
