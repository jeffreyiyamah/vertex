import React from 'react';

const Logo = () => {
  return (
    <svg 
      width="60" 
      height="60" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginRight: '12px',
      }}
    >
      {/* Exact match to the hexagonal logo in Image 1 */}
      <path
        d="M50 5 L12 25 V75 L50 95 L88 75 V25 L50 5 Z
           M50 25 L75 40 V60 L50 75 L25 60 V40 L50 25 Z"
        fill="white"
      />
    </svg>
  );
};

export default Logo;