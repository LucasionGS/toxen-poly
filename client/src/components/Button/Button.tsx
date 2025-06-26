import React from "react";
import "./Button.scss";

interface ButtonProps {
  fullWidth?: boolean;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "filled" | "subtle";
  children?: React.ReactNode;
  color?: string,
  style?: React.CSSProperties,
  disabled?: boolean;
}

function Button({
  fullWidth,
  className,
  onClick,
  variant,
  children,
  style = {},
  disabled = false
}: ButtonProps) {
  const buttonClass = `button ${variant} ${fullWidth ? "full-width" : ""} ${className} ${disabled ? "disabled" : ""}`;
  
  return (
    <button
      className={buttonClass}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...style
      } as any}
    >
      {children}
    </button>
  );
};

export default Button;