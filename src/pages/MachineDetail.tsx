import React, { useState } from "react";
import { useMachines } from "../hooks/useMachines";
import axios from "axios";
import { useParams } from "react-router-dom";

type PredictionResponse = {
  prediction?: string;
  error?: string;
};

export default function MachineDetail() {
  const { id } = useParams();
  const { machines } = useMachines();
  const machine = machines.find((m) => m.id === Number(id));

  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!machine) return <div>Machine not found.</div>;

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a .npz vibration file first!");
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post<PredictionResponse>(
        "https://smartfactory-ml-backend-production.up.railway.app/predict/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.error) {
        setPrediction("Error: " + res.data.error);
      } else if (res.data.prediction) {
        setPrediction(res.data.prediction);
      } else {
        setPrediction("Unexpected response from server");
      }
    } catch (err) {
      setPrediction("Prediction failed. ML API unreachable.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Machine Details: {machine.name}</h1>
      <p><strong>Status:</strong> {machine.status}</p>
      <p><strong>Temperature:</strong> {machine.temperature}°C</p>
      <p><strong>Vibration:</strong> {machine.vibration} mm/s</p>
      <p><strong>Load:</strong> {machine.current_load}%</p>

      <hr />

      <h2>Fault Prediction</h2>

      <input
        type="file"
        accept=".npz"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "black",
          color: "white",
          cursor: "pointer"
        }}
      >
        {loading ? "Predicting..." : "Predict Fault"}
      </button>

      {prediction && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f0f0",
            borderRadius: "8px"
          }}
        >
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
    </div>
  );
}
