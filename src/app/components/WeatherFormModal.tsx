import { WeatherReport, WeatherFormData } from "../types";

type WeatherFormModalProps = {
  show: boolean;
  editingReport: WeatherReport | null;
  formData: WeatherFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: WeatherFormData) => void;
};

export default function WeatherFormModal({
  show,
  editingReport,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
}: WeatherFormModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            {editingReport ? "Edit Weather Report" : "Create Weather Report"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                onFormDataChange({ ...formData, city: e.target.value })
              }
              required
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                onFormDataChange({ ...formData, country: e.target.value })
              }
              required
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Temperature (-70 to 50) *
            </label>
            <input
              type="number"
              min="-70"
              max="50"
              step="0.1"
              value={formData.temperature}
              onChange={(e) =>
                onFormDataChange({ ...formData, temperature: e.target.value })
              }
              required
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  condition: e.target.value as WeatherReport["condition"],
                })
              }
              required
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sunny">Sunny</option>
              <option value="rainy">Rainy</option>
              <option value="cloudy">Cloudy</option>
              <option value="stormy">Stormy</option>
              <option value="snowy">Snowy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              User ID *
            </label>
            <input
              type="text"
              value={formData.userId || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, userId: e.target.value })
              }
              required
              placeholder={editingReport?.user?.id || editingReport?.userId || "Enter user ID"}
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {editingReport ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
