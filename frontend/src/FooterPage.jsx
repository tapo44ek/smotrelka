export default function FooterPage({ darkMode }) {
	return (
	  <footer
		className={`w-full py-4 transition-colors bg-transparent z-50 flex-shrink-0 ${
		  darkMode ? "text-gray-100" : "text-gray-900"
		}`}
	  >
		<div className="container mx-auto max-w-screen-xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
		  
		  {/* 📌 Навигация (с разреженными ссылками) */}
		  <ul className="flex flex-col items-center text-center space-y-4 md:flex-row md:space-y-0 md:space-x-8 tracking-wide">
			<li className="hover:opacity-80 cursor-pointer" href="http://localhost:5173/privacy">
			<a
			  href="http://localhost:5173/privacy"
			  target="_blank"
			>
				Политика обработки персональных данных
			</a>
			</li>
		  </ul>
  
		  {/* 📌 Социальные сети */}
		  <div className="flex space-x-6">
			<a
			  href="https://t.me/smotrelka_space"
			  title="Telegram"
			  className="flex items-center justify-center w-10 h-10 rounded-full transition"
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				fill={darkMode ? "#ffffff" : "#000000"}
				className="w-7 h-7"
			  >
				<path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031z"></path>
				</svg>
			</a>
  
			<a
			  href="https://github.com/tapo44ek/smotrelka"
			  title="GitHub"
			  className="flex items-center justify-center w-10 h-10 rounded-full transition"
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				fill={darkMode ? "#ffffff" : "#000000"}
				viewBox="0 0 32 32"
				className="w-7 h-7"
			  >
				<path d="M16 0C7.163 0 0 7.163 0 16c0 7.091 4.597 13.124 10.973 15.255.802.148 1.096-.348 1.096-.773 0-.383-.015-1.654-.022-2.999-4.383.952-5.311-1.857-5.311-1.857-.717-1.82-1.751-2.306-1.751-2.306-1.431-.979.108-.959.108-.959 1.585.112 2.419 1.629 2.419 1.629 1.408 2.413 3.692 1.715 4.595 1.313.136-1.012.532-1.705.968-2.097-3.385-.385-6.951-1.692-6.951-7.54 0-1.667.597-3.033 1.574-4.104-.159-.385-.685-1.937.128-4.044 0 0 1.379-.441 4.521 1.694 1.31-.364 2.716-.546 4.112-.551 1.396.005 2.802.187 4.113.551 3.142-2.135 4.519-1.694 4.519-1.694.814 2.107.288 3.659.128 4.044.978 1.071 1.574 2.437 1.574 4.104 0 5.864-3.572 7.166-6.976 7.524.547.473 1.035 1.401 1.035 2.824 0 2.04-.018 3.687-.018 4.194 0 .498.32 1.08 1.22 .896C27.405 29.116 32 23.09 32 16 32 7.163 24.837 0 16 0z"></path>
				</svg>
			</a>
		  </div>
		</div>
	  </footer>
	);
  }