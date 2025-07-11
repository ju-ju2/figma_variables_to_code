import React from "react";

interface ErrorProps {
  message: React.ReactNode;
  description: React.ReactNode | string[];
}

const Error: React.FC<ErrorProps> = ({ message, description }) => {
  return (
    <div className="flex flex-col gap-8 p-4 border border-red-500 rounded-md bg-red-50">
      <div className="flex items-center text-red-700 font-semibold">
        {/* Icon can be from lucide-react or @radix-ui/react-icons */}
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636l-12.728 12.728M6.343 6.343l12.728 12.728"
          />
        </svg>
        <span>{message}</span>
      </div>

      {Array.isArray(description) ? (
        <ul className="list-disc list-inside text-sm text-red-700">
          {description.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-red-700">{description}</div>
      )}
    </div>
  );
};

export default Error;
