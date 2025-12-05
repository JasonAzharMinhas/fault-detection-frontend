import React from "react";

export default function DeleteConfirmModal({ open, onClose, onDelete }: any) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", padding: 20, width: 350 }}>
        <h3>Are you sure you want to delete this machine?</h3>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 bg-red-600 text-white" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
