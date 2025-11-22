import React from "react";

const Loader = ({ size = 24 }) => {
  const s = `${size}px`;
  return (
    <div style={{ width: s, height: s }} className="loader-inline">
      <style>{`
        .loader-inline { display:inline-flex; align-items:center; justify-content:center }
        .loader-inline:after {
          content: '';
          width: ${s};
          height: ${s};
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: rgba(255,255,255,0.9);
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Loader;
