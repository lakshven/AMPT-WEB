import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";

interface ModalPopupProps {
  message: string;
  onClose: () => void;
  children?: React.ReactNode;   // ⭐ allow custom buttons
}

const ModalPopup: React.FC<ModalPopupProps> = ({ message, onClose, children}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-96 relative p-6 text-center">
        
        <div className="absolute top-0 left-0 w-full bg-green-600 text-white py-2 rounded-t-lg font-bold text-lg">
          SUCCESS
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold"
        >
          <AiOutlineCloseCircle className="text-red-600 hover:text-red-800" />
        </button>

        <div className="mt-10 mb-6 text-lg font-medium text-gray-800">
          {message}
        </div>
        {children ? (
          <div className="mt-4">{children}</div>
        ) : (
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
        )}


      </div>
    </div>
  );
};

export default ModalPopup;