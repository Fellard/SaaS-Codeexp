
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-[40px] md:h-[50px]',
    medium: 'h-[50px] md:h-[80px]',
    large: 'h-[120px] md:h-[150px]',
  };

  return (
    <Link to="/" className={`inline-block ${className}`}>
      <img
        src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/b1bb0e5f2be82a2e15f22240a629e78c.png"
        alt="IWS LAAYOUNE Logo"
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300`}
      />
    </Link>
  );
};

export default Logo;
