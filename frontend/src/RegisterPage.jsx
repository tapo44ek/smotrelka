import AuthImage from "./AuthImage";
import RegisterForm from "./RegisterForm";

const RegisterPage = () => {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
              
              <div class="block2 hidden overflow-hidden bg-gradient-to-br from-slate-200 via-gray-50 to-stone-200 lg:block">
                  <AuthImage/>
              </div>
              <div class="block1 z-10 flex min-h-screen items-center justify-center py-12 shadow-2xl">
                  <div class="mx-auto grid w-[350px] gap-6">
                      <div class="grid gap-2 text-center">
                          <h1 class="text-3xl font-bold">С подключением!</h1>
                          <p class="text-grey text-muted-foreground pb-4">Введите данные для регистрации</p>
                          <RegisterForm />
                      </div>
                  </div>
              </div>
          </div>
    );
  };
  
  export default RegisterPage;