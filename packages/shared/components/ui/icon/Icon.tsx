import React from 'react';
import Image from 'next/image';

interface IconProps {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, alt, width = 24, height = 24, className }) => (
  <Image
    src={`/icons/${name}.svg`}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading="lazy"
  />
);

export default Icon;
