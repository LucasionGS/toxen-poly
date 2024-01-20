import React from "react";
import "./Button.scss";

interface ButtonProps {
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: "filled" | "subtle";
  children?: React.ReactNode;
  color?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
}

function Button({ fullWidth, className, onClick, variant, children }: ButtonProps) {
  const buttonClass = `button ${variant} ${fullWidth ? "full-width" : ""} ${className}`;

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      style={{
        "--color": "#fff",
      } as any}
    >
      {children}
    </button>
  );
};

export default Button;