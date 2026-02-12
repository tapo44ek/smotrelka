import { useState } from "react";
import { motion } from "framer-motion";
import AuthImage from "./AuthImage";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = ({darkMode}) => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen relative overflow-hidden">
      {/* Левая часть (Форма) */}
      <motion.div
        className="block1 z-10 flex min-h-screen items-center justify-center py-12 shadow-2xl"
        animate={{ x: isRegistering ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isRegistering ? "С подключением!" : "Добро пожаловать"}
            </h1>
            <p className="text-grey text-muted-foreground pb-4">
              {isRegistering ? "Введите данные для регистрации" : "Введите данные для входа"}
            </p>
            {isRegistering ? <RegisterForm /> : <LoginForm darkMode={darkMode} />}
          </div>
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Назад к входу" : "Регистрация"}
          </button>
        </div>
      </motion.div>

      {/* Правая часть (Картинка) */}
      <motion.div
        className="block2 hidden overflow-hidden bg-gradient-to-br from-slate-200 via-gray-50 to-stone-200 lg:block absolute top-0 left-0 w-full h-full lg:w-1/2"
        animate={{ x: isRegistering ? "0%" : "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <AuthImage />
      </motion.div>
    </div>
  );
};

export default AuthPage;