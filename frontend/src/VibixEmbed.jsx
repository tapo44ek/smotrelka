// Плеер Vibix через Rendex SDK (скрипты подключены в index.html).
// SDK сам находит <ins> и вставляет в него iframe, поэтому при смене
// фильма/темы компонент нужно пересоздавать через key.
const VibixEmbed = ({ embed, darkMode }) => (
    <ins
        className="block w-full h-full"
        data-publisher-id={embed.publisherId}
        data-type={embed.type}
        data-id={embed.id}
        data-width="100%"
        data-height="100%"
        data-design={darkMode ? "5" : "1"}
    ></ins>
);

export default VibixEmbed;
