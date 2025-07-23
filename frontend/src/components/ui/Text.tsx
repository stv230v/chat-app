import React from "react";

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function TextInput({
  value,
  onChange,
  placeholder = "メッセージを入力してください",
  disabled = false,
  className = "",
  onKeyDown,
  type = "text",
}: TextInputProps) {
  const baseStyles =
    "flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  const inputStyles = `${baseStyles} ${className}`;

  return (
    <input
      type={type}
      className={inputStyles}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  );
}
