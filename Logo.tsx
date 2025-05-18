import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="/vertex-logo.png"
      alt="Vertex Logo"
      width={90}
      height={0}
      style={{
        marginRight: '12px',
      }}
    />
  );
};

export default Logo;