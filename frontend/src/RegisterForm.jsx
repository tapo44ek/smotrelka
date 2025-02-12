import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/auth/register",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", response.data.access_token);
      setMessage("Успешная регистрация!");
      window.location.href = "http://10.9.96.160:3001/dashboard";
    } catch (error) {
      setMessage(
        "Ошибка: " + (error.response?.data?.detail || "Неизвестная ошибка")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 text-center">
      {/* 📌 Поле: Почта */}
      <div className="text-left">
        <label className="text-sm font-medium">Почта</label>
        <input
          {...register("email", { required: "Почта обязательна" })}
          type="email"
          className="border bg-background placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 h-10 w-full rounded-md px-3 py-2 text-sm"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* 📌 Поле: Логин */}
      <div className="text-left">
        <label className="text-sm font-medium">Логин</label>
        <input
          {...register("name", { required: "Логин обязателен" })}
          type="text"
          className="border bg-background placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 h-10 w-full rounded-md px-3 py-2 text-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* 📌 Поле: Пароль */}
      <div className="text-left">
        <label className="text-sm font-medium">Пароль</label>
        <input
          {...register("password", { required: "Пароль обязателен" })}
          type="password"
          className="border bg-background placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 h-10 w-full rounded-md px-3 py-2 text-sm"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* ✅ Галочка согласия */}
      <div className="flex items-center gap-2 text-left">
        <input
          type="checkbox"
          {...register("agreeToPolicy", {
            required: "Вы должны согласиться с политикой",
          })}
          className="w-4 h-4 accent-blue-500"
        />
        <label className="text-sm">
          Я соглашаюсь с{" "}
          <a href="/privacy" className="text-blue-500 underline">
            политикой обработки персональных данных
          </a>
        </label>
      </div>
      {errors.agreeToPolicy && (
        <p className="text-red-500 text-sm">{errors.agreeToPolicy.message}</p>
      )}

      {/* 🔹 Кнопка регистрации */}
      <button
        type="submit"
        className="bg-black text-white hover:bg-gray-700 transition rounded-md px-4 py-2 w-full"
      >
        Зарегистрироваться
      </button>
    </form>
  );
};

export default RegisterForm;