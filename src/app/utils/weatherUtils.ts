export const getWeatherEmoji = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "sunny":
      return "☀️";
    case "rainy":
      return "🌧️";
    case "cloudy":
      return "☁️";
    case "stormy":
      return "⛈️";
    case "snowy":
      return "❄️";
    default:
      return "🌡️";
  }
};

export const getWeatherColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "sunny":
      return "from-orange-500 via-amber-400 to-yellow-200";
    case "rainy":
      return "from-blue-900 via-blue-700 to-slate-400";
    case "cloudy":
      return "from-slate-600 via-slate-400 to-gray-300";
    case "stormy":
      return "from-indigo-900 via-purple-800 to-gray-700";
    case "snowy":
      return "from-cyan-200 via-blue-100 to-white";
    default:
      return "from-gray-600 via-gray-500 to-gray-400";
  }
};
