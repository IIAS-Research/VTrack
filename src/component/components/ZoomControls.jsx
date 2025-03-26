import React from "react";

export function ZoomControls({ zoom, zoomIn, zoomOut, resetZoom, panEnabled, setPanEnabled }) {
  return (
    <div className="flex flex-col bg-slate-50 rounded p-2">
      <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">Zoom & Pan</h4>
      <div className="flex items-center justify-center mb-2">
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-l bg-indigo-50 hover:bg-indigo-100 border border-r-0 border-indigo-200"
          title="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" transform="rotate(45 8 8)"/>
          </svg>
        </button>
        <div className="px-2 py-1 border-y border-indigo-200 bg-white">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-r bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
          title="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-center">
        <label className="mr-2">Pan Mode</label>
        <input
          type="checkbox"
          checked={panEnabled}
          onChange={(e) => setPanEnabled(e.target.checked)}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}