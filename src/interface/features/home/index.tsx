"use client";

import { useQueryState } from "nuqs";

export const HomePage = () => {
  const [input, setInput] = useQueryState("input", {
    defaultValue: "",
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="break-all text-lg">{input || "Type something..."}</p>
        </div>
        <input
          aria-label="Input field"
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          type="text"
          value={input || ""}
        />
      </div>
    </div>
  );
};
