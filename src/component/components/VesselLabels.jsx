import React from "react";
import { vesselGroups } from "../constants/vesselGroups";

export function VesselLabels({ title, colors, selectedLabel, setSelectedLabel, selectedGroup, setSelectedGroup }) {
    const groupNames = Object.keys(vesselGroups);
    const currentLabels = vesselGroups[selectedGroup];
/*
    const bifurcationLabels = [
        "Bifurcation carotidienne",
        "MCA1 -> MCA2",
        "MCA2 -> MCA3",
        "ACA1 -> ACA2",
        "ACA2 -> ACA3",
        "PCA1 -> PCA2",
        "PCA2 -> PCA3"
    ];

    const bboxLabels = ["Occlusion", 
                        "Hide Region"];

    const vesselLabels = Object.keys(colors)
        .filter(label => !bifurcationLabels.includes(label))
        .filter(label => !bboxLabels.includes(label));
*/
    return (
        <div className="w-full flex flex-col gap-4">
            {/* Choix du groupe */}
            <div className="flex flex-wrap gap-2 justify-center">
                {groupNames.map(group => (
                    <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm border ${
                            selectedGroup === group
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white hover:bg-indigo-50 border-gray-300'
                        }`}
                    >
                        {group}
                    </button>
                ))}
            </div>

            <div className="flex flex-row gap-4 justify-between">

              {/* Vessels */}
              <div className="flex-1">
                <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">Vessels</h5>
                {currentLabels.vessels.map(label => (
                  <button
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    className={`mb-1 px-2 py-1 rounded text-sm w-full ${
                      selectedLabel === label ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors[label] || 'white',
                      color: selectedLabel === label ? 'white' : 'black'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            
              {/* Bifurcations */}
              <div className="flex-1">
                <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">Bifurcations</h5>
                {currentLabels.bifurcations.map(label => (
                  <button
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    className={`mb-1 px-2 py-1 rounded text-sm w-full ${
                      selectedLabel === label ? 'ring-2 ring-pink-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors[label] || 'white',
                      color: selectedLabel === label ? 'white' : 'black'
                    }}
                  >
                    🔀 {label}
                  </button>
                ))}
              </div>
            </div>

            {/* No selection */}
            <button
                onClick={() => setSelectedLabel(null)}
                className={`mt-2 px-2 py-1 rounded w-full border text-sm font-medium shadow-sm ${
                    selectedLabel === null
                        ? 'bg-gray-300 text-gray-800 border-gray-400'
                        : 'bg-white hover:bg-gray-100 border-gray-200'
                }`}
            >
                No selection
            </button>
        </div>
    );
}