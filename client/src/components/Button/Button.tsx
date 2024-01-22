import React from "react";
import "./Button.scss";

interface ButtonProps {
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: "filled" | "subtle";
  children?: React.ReactNode;
  color?: string,
  style?: React.CSSProperties,
}

function Button({
  fullWidth,
  className,
  onClick,
  variant,
  children,
  style = {}
}: ButtonProps) {
  const buttonClass = `button ${variant} ${fullWidth ? "full-width" : ""} ${className}`;
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      style={{
        ...style
      } as any}
    >
      {children}
    </button>
  );
};

export default Button;