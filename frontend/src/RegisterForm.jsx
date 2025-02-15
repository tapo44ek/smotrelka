import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${backendUrl}/auth/auth/register`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", response.data.access_token);
      setMessage("Успешная регистрация!");
      navigate('/');
    } catch (error) {

      if (error.response.status === 400) {
        setMessage("❌ " + (error.response?.data?.detail || "Неизвестная ошибка"));
        return;
      }

      setMessage(
        "❌ Ошибка: " + (error.response?.data?.detail || "Неизвестная ошибка")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 text-center">
      {/* 📌 Поле: Почта */}
      <div className="text-left">
      {message && <p className="mt-3 text-center text-red font-semibold">{message}</p>}
        <label className="text-sm font-medium">Почта</label>
        <input
          {...register("email", { required: "Почта обязательна" })}
          type="email"
          className="border bg-transparent placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 h-10 w-full rounded-md px-3 py-2 text-sm"
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
          className="border bg-transparent placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 h-10 w-full rounded-md px-3 py-2 text-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* 📌 Поле: Пароль */}
      <div className="text-left">
        <label className="text-sm font-medium">Пароль</label>
        <div className="relative w-full">
      <input
        {...register("password", { required: "❌ Пароль обязателен" })}
        type={showPassword ? "text" : "password"}
        className="peer border-input bg-transparent ring-offset-background 
                   placeholder:text-muted-foreground focus-visible:ring-ring 
                   flex h-10 w-full rounded-md border px-3 py-2 pr-10 text-sm 
                   file:border-0 file:bg-transparent file:text-sm file:font-medium 
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                   disabled:cursor-not-allowed disabled:opacity-50"
        id="password"
        name="password"
        aria-describedby="password-description"
        aria-invalid="false"
      />
      <button
        onClick={() => setShowPassword(!showPassword)}
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
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