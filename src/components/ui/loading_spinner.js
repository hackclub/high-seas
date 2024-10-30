import { useMemo, useEffect, useState } from "react";
import { loadingSpinners, sample } from "../../../lib/flavor";

const LoadingSpinner = () => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(sample(loadingSpinners));
  }, []);

  return useMemo(
    () => (
      <div>
        {src && (
          <img
            src={src}
            className="animate-spin"
            style={{
              filter: "invert(0.5) sepia(1) saturate(1) hue-rotate(225deg)",
              animationDuration: "2s",
            }}
            alt="loading spinner"
          />
        )}
      </div>
    ),
    [src],
  );
};

export { LoadingSpinner };
