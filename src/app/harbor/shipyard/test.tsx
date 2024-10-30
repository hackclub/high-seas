import React, { useState } from "react";

const FullScreenOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
    // Toggle scrolling on body
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  return (
    <div>
      <button
        onClick={toggleOverlay}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle Overlay
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Overlay Content</h2>
            <p className="mb-4">
              This is a full-screen overlay that prevents scrolling of the main
              content.
            </p>
            <button
              onClick={toggleOverlay}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close Overlay
            </button>
          </div>
        </div>
      )}

      {/* Example content to demonstrate scrolling being blocked */}
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Main Content</h1>
        {[...Array(20)].map((_, i) => (
          <p key={i} className="mb-4">
            This is paragraph {i + 1} to demonstrate scrolling content.
          </p>
        ))}
      </div>
    </div>
  );
};

export default FullScreenOverlay;
