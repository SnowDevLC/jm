import { createPortal } from "react-dom";

interface LoaderProps {
  usePortal?: boolean;
}

export default function Loader({ usePortal = false }: LoaderProps) {
  const content = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 dark:bg-gray-950/60">
      <div className="flex items-center justify-center w-40 h-40 bg-background rounded-xl shadow-xl animate-bounce-soft p-6">
        <img src="/JM-logo.png" alt="Loading..." />
      </div>
    </div>
  );

  if (usePortal) {
    if (typeof window === "undefined") return null;
    return createPortal(content, document.body);
  }

  return content;
}
