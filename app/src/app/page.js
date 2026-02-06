"use client"

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    usage: "",
    minBudget: "",
    maxBudget: "",
    resolution: "",
    performance: "",
  });

  const [build, setBuild] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "minBudget" || name === "maxBudget"
          ? value === ""
            ? ""
            : Math.max(0, Number(value))
          : value,
    }));
  };



  const handleGenerate = async () => {
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
      setError(null);
      setBuild(data.build);
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

      <label className="block mb-2 font-semibold">Budget ($)</label>
      <div className="flex gap-2 mb-4">
        <input
          name="minBudget"
          placeholder="Min"
          type="number"
          value={form.minBudget}
          min="0"
          onChange={handleChange}
          className="border p-2 w-1/2 rounded"
        />
        <input
          name="maxBudget"
          placeholder="Max"
          type="number"
          value={form.maxBudget}
          onChange={handleChange}
          className="border p-2 w-1/2 rounded"
        />
      </div>

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
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
      >
        Generate Build
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
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
