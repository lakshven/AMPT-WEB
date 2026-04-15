import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import ModalPopup from "../components/common/ModalPopup";

// ✅ Define the context shape
interface PopupContextType {
  showPopup: (message: string) => void;
  closePopup: () => void;
}

// ✅ Create context with default empty functions
const PopupContext = createContext<PopupContextType>({
  showPopup: () => {},
  closePopup: () => {},
});

// ✅ Props for provider
interface PopupProviderProps {
  children: ReactNode;
}

// ✅ Add a static timer property to the function (TypeScript-safe)
interface PopupProviderComponent extends React.FC<PopupProviderProps> {
  _timer?: number;
}

export const PopupProvider: PopupProviderComponent = ({ children }) => {
  const [popup, setPopup] = useState<string | null>(null);

  // ✅ Auto-hide popup after 3 seconds
  const showPopup = (message: string) => {
    const msg =
      typeof message === "string" ? message : String(message ?? "");

    setPopup(msg);

    // Clear previous timer
    window.clearTimeout(PopupProvider._timer);

    // Set new timer
    PopupProvider._timer = window.setTimeout(() => {
      setPopup(null);
    }, 3000);
  };

  const closePopup = () => {
    window.clearTimeout(PopupProvider._timer);
    setPopup(null);
  };

  return (
    <PopupContext.Provider value={{ showPopup, closePopup }}>
      {children}
      {popup && <ModalPopup message={popup} onClose={closePopup} />}
    </PopupContext.Provider>
  );
};

export function usePopup() {
  return useContext(PopupContext);
}