import { WeatherReport } from "../types";
import { getWeatherEmoji, getWeatherColor } from "../utils/weatherUtils";

type WeatherDisplayProps = {
  report: WeatherReport;
  isFading: boolean;
};

export default function WeatherDisplay({ report, isFading }: WeatherDisplayProps) {
  return (
    <div className="relative overflow-hidden p-8 text-white">
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getWeatherColor(report.condition)} transition-opacity duration-1000 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-6xl mb-4 drop-shadow-md animate-bounce-slow">
          {getWeatherEmoji(report.condition)}
        </div>
        <h2 className="text-3xl font-bold mb-1 drop-shadow-sm">
          {report.city}
        </h2>
        <p className="text-lg opacity-90 mb-2 font-medium">
          {report.country}
        </p>
        <p className="text-lg opacity-90 mb-6 font-medium capitalize">
          {report.condition}
        </p>

        <div className="text-7xl font-bold mb-6 tracking-tighter drop-shadow-lg">
          {report.temperature}°
        </div>

        <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider opacity-80">
              User ID
            </span>
            <span className="block text-xl font-bold mt-1">
              {report.user?.id || report.userId || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
