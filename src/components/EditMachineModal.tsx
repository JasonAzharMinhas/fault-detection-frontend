import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";

export default function EditMachineModal({ open, onClose, machine, reload }: any) {
  const [name, setName] = useState(machine?.name ?? "");
  const [load, setLoad] = useState(machine?.current_load ?? 0);
  const [vibration, setVibration] = useState(machine?.vibration ?? 0);
  const [temperature, setTemperature] = useState(machine?.temperature ?? 0);

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setLoad(machine.current_load);
      setVibration(machine.vibration);
      setTemperature(machine.temperature);
    }
  }, [machine]);

  if (!open) return null;

  const save = async () => {
    try {
      await supabase.from("machines").update({
        name,
        current_load: load,
        vibration,
        temperature,
        updated_at: new Date().toISOString(),
      }).eq("id", machine.id);
    } catch (e) {
      // ignore
    }
    if (typeof reload === "function") reload();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", padding: 20, width: 400 }}>
        <h2>Edit Machine</h2>

        <label className="block mt-2">Name</label>
        <input className="w-full border p-1" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="block mt-2">Load (%)</label>
        <input className="w-full border p-1" type="number" value={load} onChange={(e) => setLoad(Number(e.target.value))} />

        <label className="block mt-2">Vibration (mm/s)</label>
        <input className="w-full border p-1" type="number" value={vibration} onChange={(e) => setVibration(Number(e.target.value))} />

        <label className="block mt-2">Temperature (°C)</label>
        <input className="w-full border p-1" type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 text-white" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
