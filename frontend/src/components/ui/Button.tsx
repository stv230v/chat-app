import React from "react";

interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  loadingText?: string;
  defaultText?: string;
  className?: string;
  onClick?: () => void;
}

export default function SubmitButton({
  isLoading,
  disabled = false,
  loadingText = "送信中...",
  defaultText = "送信",
  className = "",
  onClick,
}: SubmitButtonProps) {
  const baseStyles =
    "px-6 py-3 font-semibold text-white rounded-lg cursor-pointer transition";
  const loadingStyles = "bg-gray-400";
  const activeStyles = "bg-blue-500 hover:bg-blue-600";

  const buttonStyles = `${baseStyles} ${
    isLoading || disabled ? loadingStyles : activeStyles
  } ${className}`;

  return (
    <input
      type="submit"
      value={isLoading ? loadingText : defaultText}
      className={buttonStyles}
      disabled={isLoading || disabled}
      onClick={onClick}
    />
  );
}
