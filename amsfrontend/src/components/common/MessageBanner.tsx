interface MessageBannerProps {
  type: "success" | "error" | "warning";
  text: string;
  onClose?: () => void;   // ⭐ ADD THIS
}

const MessageBanner: React.FC<MessageBannerProps> = ({ type, text, onClose }) => {
  return (
    <div
      className={`p-3 mb-4 rounded ${
        type === "success"
          ? "bg-green-200 text-green-800"
          : type === "error"
          ? "bg-red-200 text-red-800"
          : "bg-yellow-200 text-yellow-800"
      }`}
    >
      <div className="flex justify-between items-center">
        <span>{text}</span>

        {onClose && (
          <button
            onClick={onClose}
            className="font-bold ml-4 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBanner;