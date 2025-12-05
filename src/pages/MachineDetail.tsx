import React, { useEffect, useState } from "react";
import { useMachines } from "../hooks/useMachines";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import HealthScore from "../components/HealthScore";
import LiveDataSimulator from "../components/LiveDataSimulator";
import Notifications, { pushNotification } from "../components/Notifications";
import EditMachineModal from "../components/EditMachineModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

type PredictionResponse = {
  prediction?: string;
  error?: string;
};

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machines } = useMachines();
  const machine = machines.find((m) => m.id === Number(id));

  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    loadJobs();
    const listen = () => loadJobs();
    window.addEventListener("sf:machine-updated", listen);
    return () => window.removeEventListener("sf:machine-updated", listen);
  }, []);

  if (!machine) return <div>Machine not found.</div>;

  async function loadJobs() {
    try {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("machine_id", machine.id)
        .order("start_time", { ascending: true });
      setJobs(data || []);
    } catch (e) {
      setJobs([]);
    }
  }

  /** ⭐ FIXED FAULT LOGIC */
  function classifyFault(vib: number, temp: number, load: number) {
    if (vib > 7) return "Outer Race Fault";
    if (temp > 70) return "Inner Race Fault";
    if (load > 90) return "Ball Fault";
    return "Normal";
  }

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

      const vib = machine.vibration ?? 0;
      const temp = machine.temperature ?? 0;
      const load = machine.current_load ?? 0;

      // ⭐ Rule-based final classification (no override)
      const finalPred = classifyFault(vib, temp, load);

      setPrediction(finalPred);

      pushNotification({
        title: `Fault: ${machine.name}`,
        message: `${finalPred} detected on ${machine.name}`,
      });

      await supabase.from("fault_logs").insert([
        {
          machine_id: machine.id,
          fault_type: finalPred,
          severity: finalPred === "Normal" ? "low" : "high",
          component: "bearing",
          user_id: machine.user_id || "system",
        },
      ]);

      await supabase.from("jobs").insert([
        {
          name: `Maintenance – ${finalPred}`,
          priority: "High",
          status: "pending",
          start_time: new Date().toISOString(),
          machine_id: machine.id,
          user_id: machine.user_id || "system",
        },
      ]);

      loadJobs();
    } catch (err) {
      setPrediction("Prediction failed. ML API unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("machines").delete().eq("id", machine.id);
    navigate("/dashboard");
  };

  const simInitial = (() => {
    const key = `sf_sim_${machine.id}`;
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (stored) return stored;
    return {
      temperature: machine.temperature ?? 50,
      vibration: machine.vibration ?? 1.2,
      current_load: machine.current_load ?? 40,
    };
  })();

  return (
    <div style={{ padding: 20 }}>
      <div className="flex items-start gap-6">
        <div style={{ flex: 1 }}>
          <h1 className="text-2xl font-bold">Machine: {machine.name}</h1>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium">{machine.status}</div>
            </div>

            <HealthScore
              temperature={machine.temperature ?? 0}
              vibration={machine.vibration ?? 0}
              load={machine.current_load ?? 0}
            />

            <div>
              <div className="text-sm text-gray-600">Temperature</div>
              <div className="font-medium">{machine.temperature} °C</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Vibration</div>
              <div className="font-medium">{machine.vibration} mm/s</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Load</div>
              <div className="font-medium">{machine.current_load} %</div>
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="font-medium">Fault Prediction</h3>
          <input
            type="file"
            accept=".npz"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-3 px-3 py-1 bg-black text-white rounded"
          >
            {loading ? "Predicting..." : "Predict Fault"}
          </button>

          {prediction && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <strong>Prediction:</strong> {prediction}
            </div>
          )}
        </div>

        <aside style={{ width: 320 }}>
          <LiveDataSimulator machineId={machine.id} initial={simInitial} />
          <Notifications />
        </aside>
      </div>

      <EditMachineModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        machine={machine}
        reload={loadJobs}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
