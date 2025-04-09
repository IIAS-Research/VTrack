import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

export function ZoomControls({ zoom, zoomIn, zoomOut, resetZoom }) {
  return (
    <div className="flex flex-col bg-slate-50 rounded p-2">
      <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">Zoom</h4>
      <div className="flex items-center justify-center mb-2">
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-l bg-indigo-50 hover:bg-indigo-100 border border-r-0 border-indigo-200"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <div className="px-2 py-1 border-y border-indigo-200 bg-white">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-r bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}