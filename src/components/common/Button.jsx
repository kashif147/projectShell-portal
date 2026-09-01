import React from 'react';
import { Button as AntButton } from 'antd';
import PropTypes from 'prop-types';

const Button = ({
  children,
  type = 'primary',
  size = 'middle',
  variant,
  icon,
  block,
  className = '',
  loading = false,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle =
      'font-inter font-medium tracking-tight transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.98] select-none';

    const sizeClasses = {
      large: 'text-sm font-semibold px-6 h-11 rounded-xl',
      middle: 'text-sm px-4 h-9 rounded-lg',
      small: 'text-xs px-3 h-7 rounded-md',
    };

    const typeClasses = {
      primary:
        'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md hover:shadow-blue-500/20 border-0',
      default:
        'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm',
      link: 'text-blue-600 hover:text-blue-700 hover:underline shadow-none bg-transparent border-0 p-0',
      text: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 shadow-none border-0',
      dashed:
        'bg-white text-slate-700 border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600',
    };

    const dangerStyle = props.danger
      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-sm shadow-red-500/20 border-0'
      : '';

    return `${baseStyle} ${sizeClasses[size] || sizeClasses.middle} ${
      dangerStyle || typeClasses[type] || typeClasses.default
    } ${className}`;
  };

  return (
    <AntButton
      type={type}
      size={size}
      loading={loading}
      icon={icon}
      block={block}
      className={getButtonStyle()}
      {...props}>
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
  className: PropTypes.string,
  loading: PropTypes.bool,
};

export default Button;