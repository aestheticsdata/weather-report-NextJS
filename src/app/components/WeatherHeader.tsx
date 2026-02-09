import { WeatherReport, UserType } from "../types";

type WeatherHeaderProps = {
  reports: WeatherReport[];
  selectedReportId: string;
  userType: UserType;
  selectedReport: WeatherReport | null;
  onReportChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUserTypeChange: (userType: UserType) => void;
  onCreate: () => void;
  onEdit: (report: WeatherReport) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
};

export default function WeatherHeader({
  reports,
  selectedReportId,
  userType,
  selectedReport,
  onReportChange,
  onUserTypeChange,
  onCreate,
  onEdit,
  onDelete,
  onDeleteAll,
}: WeatherHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Tiny Weather 🌤️</h1>
        <div className="flex gap-2">
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Add
          </button>
          {userType === "authenticated" && (
            <button
              onClick={onDeleteAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* User Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          User Mode
        </label>
        <select
          value={userType}
          onChange={(e) => onUserTypeChange(e.target.value as UserType)}
          className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-gray-600 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          <option value="anonymous">Anonymous</option>
          <option value="authenticated">Authenticated (JOECOOL123)</option>
        </select>
      </div>

      {/* Report Selector */}
      <div className="relative">
        <select
          value={selectedReportId}
          onChange={onReportChange}
          className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          {reports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.city}, {report.country} - {report.temperature}°C ({report.condition})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedReport && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(selectedReport)}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(selectedReport.id)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
