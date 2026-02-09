import { ConfirmationModal as ConfirmationModalType } from "../types";

type ConfirmationModalProps = {
  confirmationModal: ConfirmationModalType;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  confirmationModal,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!confirmationModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Confirm</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-300 mb-6 whitespace-pre-line">
          {confirmationModal.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
