import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function LiveDataSimulator({ machineId, initial }: any) {
  const [running, setRunning] = useState(false);
  const [intervalSec, setIntervalSec] = useState(5);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const stepSim = async () => {
    try {
      const deltaTemp = (Math.random() - 0.5) * 2.0;
      const deltaVib = (Math.random() - 0.5) * 0.6;
      const deltaLoad = (Math.random() - 0.5) * 4;

      const localKey = `sf_sim_${machineId}`;
      const localRaw = JSON.parse(localStorage.getItem(localKey) || "null");
      let cur = localRaw || initial || { temperature: 50, vibration: 1.2, current_load: 40 };

      const next = {
        temperature: Math.max(15, Math.round((cur.temperature + deltaTemp) * 10) / 10),
        vibration: Math.max(0, Math.round((cur.vibration + deltaVib) * 10) / 10),
        current_load: Math.max(0, Math.min(100, Math.round((cur.current_load + deltaLoad) * 10) / 10)),
      };

      try {
        if (supabase) {
          await supabase.from("machines").update({
            temperature: next.temperature,
            vibration: next.vibration,
            current_load: next.current_load,
            updated_at: new Date().toISOString(),
          }).eq("id", machineId);
        }
      } catch (e) {
        // ignore
      }

      localStorage.setItem(localKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sf:machine-updated", { detail: { machineId, values: next } }));
    } catch (e) {
      // ignore
    }
  };

  const start = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(stepSim, Math.max(1000, intervalSec * 1000));
    setRunning(true);
  };

  const stop = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  };

  return (
    <div className="p-2 border rounded">
      <h4 className="font-medium">Live Data Simulator</h4>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-sm">Interval (s)</label>
        <input
          type="number"
          value={intervalSec}
          min={1}
          onChange={(e) => setIntervalSec(Number(e.target.value))}
          className="w-20 p-1 border rounded"
        />
        {!running ? (
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={start}>Start</button>
        ) : (
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={stop}>Stop</button>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Simulated values stored in localStorage key <code>sf_sim_{machineId}</code>.
      </div>
    </div>
  );
}
