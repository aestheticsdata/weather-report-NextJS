import { ErrorModal as ErrorModalType } from "../types";

type ErrorModalProps = {
  errorModal: ErrorModalType;
  onClose: () => void;
};

export default function ErrorModal({ errorModal, onClose }: ErrorModalProps) {
  if (!errorModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Error</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{errorModal.message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
