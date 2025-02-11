import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", data.email);
      formData.append("name", data.name);
      formData.append("password", data.password);


      const response = await axios.post("http://127.0.0.1:8000/auth/auth/register", data, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", response.data.access_token);
      setMessage("Успешный вход!");
      // navigate("hhtp://10.9.96.160:3001/dashboard");  // Перенаправляем на домашнюю страницу
      window.location.href = "http://10.9.96.160:3001/dashboard"

    } catch (error) {
      setMessage("Ошибка: " + (error.response?.data?.detail || "Неизвестная ошибка"));
    }
  };

  return (
    // <div class="block1 z-10 flex min-h-screen items-center justify-center py-12 shadow-2xl">
    //     <div class="mx-auto grid w-[350px] gap-6">
    //         <div class="grid gap-2 text-center">
    //             <h1 class="text-3xl font-bold">Добро пожаловать</h1>
    //     {message && <p className="text-center text-red-500">{message}</p>}
        <form onSubmit={handleSubmit(onSubmit)} class="grid gap-5 text-center">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left m-6">Почта</label>
            <input 
              {...register("email", { required: "Логин обязателен" })} 
              type="text" 
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70" id="email" name="email" aria-describedby=":r1:-form-item-description" aria-invalid="false"
            //   placeholder="Введите логин"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left m-6">Логин</label>
            <input 
              {...register("name", { required: "Логин обязателен" })} 
              type="text" 
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70" id="name" name="name" aria-describedby=":r1:-form-item-description" aria-invalid="false"
            //   placeholder="Введите логин"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">Пароль</label>
            <input 
              {...register("password", { required: "Пароль обязателен" })} 
              type="password" 
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="password" name="password" aria-describedby=":r1:-form-item-description" aria-invalid="false"
            //   placeholder="Введите пароль"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <button 
            type="submit" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-transparent bg-black text-white hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                      >
            Зарегистрироваться
          </button>
          <a href="/auth">
          {/* <button type="button" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
            Войти
          </button> */}
          
          </a>
        </form>
    //   </div>
    // </div>
    // </div>
  );
};

export default RegisterForm;