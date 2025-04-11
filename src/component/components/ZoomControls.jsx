import React from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export function ZoomControls({ zoom, zoomIn, zoomOut, resetZoom }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden shadow-sm border border-indigo-100 bg-gradient-to-b from-white to-indigo-50">
      <h4 className="text-lg font-bold py-2 text-center text-indigo-700 border-b border-indigo-100 bg-white">🔍 Zoom</h4>
      <div className="flex items-center justify-between p-3">
        <button
          onClick={zoomOut}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm transition-all duration-200"
          title="Zoom out"
        >
          <ZoomOut size={18} className="text-indigo-600" />
        </button>
        
        <div className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white font-medium text-indigo-800 shadow-sm">
          {Math.round(zoom * 100)}%
        </div>
        
        <button
          onClick={zoomIn}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm transition-all duration-200"
          title="Zoom in"
        >
          <ZoomIn size={18} className="text-indigo-600" />
        </button>
        
        <button
          onClick={resetZoom}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm transition-all duration-200"
          title="Reset zoom"
        >
          <RotateCcw size={18} className="text-indigo-600" />
        </button>
      </div>
    </div>
  );
}