import React from 'react';
import { Button as AntButton } from 'antd';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  type = 'primary', 
  size = 'middle',
  icon,
  block,
  className = '',
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'font-inter font-medium transition-all duration-200 flex items-center justify-center gap-2';
    
    const sizeClasses = {
      large: 'text-base px-6 h-12',
      middle: 'text-sm px-5 h-10',
      small: 'text-xs px-4 h-8'
    };

    const typeClasses = {
      primary: 'hover:opacity-90 hover:shadow-md',
      default: 'hover:bg-gray-50',
      link: 'hover:opacity-80',
      text: 'hover:bg-gray-50',
      dashed: 'hover:opacity-90'
    };

    return `${baseStyle} ${sizeClasses[size]} ${typeClasses[type]} ${className}`;
  };

  return (
    <AntButton
      type={type}
      size={size}
      icon={icon}
      block={block}
      className={getButtonStyle()}
      {...props}
    >
      {children}
    </AntButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['primary', 'default', 'link', 'text', 'dashed']),
  size: PropTypes.oneOf(['large', 'middle', 'small']),
  icon: PropTypes.node,
  block: PropTypes.bool,
  className: PropTypes.string
};

export default Button; 