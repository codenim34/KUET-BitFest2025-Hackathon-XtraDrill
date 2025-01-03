import React from 'react';
import Image from 'next/image';

const FloatingImage = ({ src, alt, className }) => {
  return (
    <div className="relative w-72 animate-[float_4s_ease-in-out_infinite]">
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
      <Image src={src} alt={alt} layout="responsive" className={`object-contain ${className}`} />
    </div>
  );
};

export default FloatingImage;