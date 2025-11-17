
import React from 'react';

interface ArrowIconProps {
  direction: 'up' | 'down';
  className?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ direction, className }) => {
  if (direction === 'up') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M7 14l5-5 5 5H7z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
};

export default ArrowIcon;
