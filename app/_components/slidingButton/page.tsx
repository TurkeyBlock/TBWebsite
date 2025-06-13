// components/SlidingButton.js
import { useState } from "react";

function SlidingButton({h = 36, w = 128, onText = "On", offText = "Off"}) {
  const [isSliding, setIsSliding] = useState(false);

  const handleSlide = () => {
    setIsSliding(!isSliding);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative bg-gray-300 rounded-full overflow-hidden" style={{width: w, height: h}}>
        <button
          onClick={handleSlide}
          //Button itself; fills the above container
          className={`absolute top-0 left-0 h-full w-1/2 bg-blue-500 text-white font-semibold rounded-full transition-transform duration-500 ${
            isSliding ? "translate-x-full" : "translate-x-0"
          }`}
        >
          {isSliding ? onText : offText}
        </button>
      </div>
    </div>
  );
}

export default SlidingButton;