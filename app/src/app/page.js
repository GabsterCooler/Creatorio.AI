"use client"

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    usage: "",
    maxBudget: "",
    resolution: "",
    performance: "",
  });

  const [build, setBuild] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const newValue =
        name === "maxBudget" ? (value === "" ? "" : Math.max(0, Number(value))) : value;

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  const handleGenerate = async () => {
    // Check if any field is empty
    const emptyFields = Object.entries(form).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      setError("Please fill out all fields before generating a build.");
      setBuild(null);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data?.error) {
        setError(data.error);
        setBuild(null);
      } else {
        setBuild(data.build);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setBuild(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">PC Builder AI</h1>

      <label className="block mb-2 font-semibold">What will you use the PC for?</label>
      <select
        name="usage"
        value={form.usage}
        onChange={handleChange}
        className="border p-2 mb-4 w-full rounded"
      >
        <option value="">Select usage</option>
        <option value="gaming">Gaming</option>
        <option value="work">Work / Office</option>
        <option value="video_editing">Video Editing</option>
        <option value="3d">3D / Rendering</option>
        <option value="streaming">Streaming</option>
        <option value="general">General Use</option>
      </select>

      <label className="block mb-2 font-semibold">Maximum Budget ($)</label>
      <input
        name="maxBudget"
        placeholder="Max"
        type="number"
        value={form.maxBudget}
        onChange={handleChange}
        className="border p-2 mb-4 w-full rounded"
      />

      <label className="block mb-2 font-semibold">Target Resolution</label>
      <select
        name="resolution"
        value={form.resolution}
        onChange={handleChange}
        className="border p-2 mb-4 w-full rounded"
      >
        <option value="">Select resolution</option>
        <option value="1080p">1080p</option>
        <option value="1440p">1440p</option>
        <option value="4k">4K</option>
      </select>

      <label className="block mb-2 font-semibold">Performance Priority</label>
      <select
        name="performance"
        value={form.performance}
        onChange={handleChange}
        className="border p-2 mb-4 w-full rounded"
      >
        <option value="">Select</option>
        <option value="best_value">Best Value</option>
        <option value="high_end">High End</option>
        <option value="future_proof">Future Proof</option>
      </select>

      <button
        onClick={handleGenerate}
        className={`bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Build"
        )}
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {build && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Recommended PC Build:</h2>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(build).map(([component, value]) => (
              <li key={component}>
                <strong>{component}:</strong>{" "}
                {Array.isArray(value) ? value.join(", ") : value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
