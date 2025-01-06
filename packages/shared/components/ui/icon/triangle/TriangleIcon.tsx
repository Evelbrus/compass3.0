import React from 'react';

const TriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className={`react-datepicker__triangle ${props.className || ''}`}
    aria-hidden="true"
    width="18"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      clipPath="url(#triangle-clip-path)"
      fill="white"
      strokeWidth="3"
      d="M0,0 H16 L8,8 Q8,8 8,8 Z"
    ></path>
    <path stroke="rgba(242, 242, 242, 0.5)" d="M0,0 H16 L8,8 Q8,8 8,8 Z"></path>
    <clipPath id="triangle-clip-path">
      <rect x="-1" y="1" width="18" height="16"></rect>
    </clipPath>
  </svg>
);

export default TriangleIcon;
