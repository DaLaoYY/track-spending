import React, { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const KeypadButton = ({ value, onClick, disabled }) => (
  <button
    onClick={() => onClick(value)}
    disabled={disabled}
    className={`
      w-full aspect-square rounded-full text-2xl font-semibold
      transition-all duration-150 flex items-center justify-center
      ${
        disabled
          ? "bg-gray-100 text-gray-400"
          : "bg-white hover:bg-gray-100 active:scale-95 shadow-md hover:shadow-lg"
      }
      sm:text-xl md:text-2xl
    `}
  >
    {value}
  </button>
);

const PinDisplay = ({ pin }) => (
  <div className="flex gap-3 mb-6 sm:mb-8">
    {[0, 1, 2, 3].map((index) => (
      <div
        key={index}
        className={`
          w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-200
          ${
            pin.length > index
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300"
          }
        `}
      />
    ))}
  </div>
);

const KeypadLogin = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const CORRECT_PIN = "1234";

  const handleKeyPress = (value) => {
    if (pin.length < 4) {
      setError("");
      setPin((prev) => prev + value);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    if (pin === CORRECT_PIN) {
      setSuccess(true);
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  const keypadNumbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["Clear", 0, "Enter"],
  ];

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-4 sm:p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-4 text-green-500">
          <Check size={48} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-green-700">
          Login Successful!
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-4 sm:p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Enter PIN</h2>

      <PinDisplay pin={pin} />

      {error && (
        <Alert variant="destructive" className="mb-4 text-sm sm:text-base">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3">
        {keypadNumbers.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((num, colIndex) => {
              if (num === "Clear") {
                return (
                  <div key={colIndex} className="w-full">
                    <KeypadButton
                      value="←"
                      onClick={handleDelete}
                      disabled={pin.length === 0}
                    />
                  </div>
                );
              }
              if (num === "Enter") {
                return (
                  <div key={colIndex} className="w-full">
                    <KeypadButton
                      value="✓"
                      onClick={handleSubmit}
                      disabled={pin.length !== 4}
                    />
                  </div>
                );
              }
              return (
                <div key={colIndex} className="w-full">
                  <KeypadButton
                    value={num}
                    onClick={handleKeyPress}
                    disabled={pin.length >= 4}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeypadLogin;
