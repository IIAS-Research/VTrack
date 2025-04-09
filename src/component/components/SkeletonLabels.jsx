import React from "react";

export function SkeletonLabels({ selectedLabel, setSelectedSkeletonLabel }) {
    const toggleSkeletonMode = () => {
      setSelectedSkeletonLabel(prev => (prev ? null : "skeleton"));
    };
  
    return (
      <div className="flex flex-col items-center w-full">
        <button
          onClick={toggleSkeletonMode}
          className={`w-full rounded px-4 py-2 text-white text-sm ${
            selectedLabel ? "bg-pink-600" : "bg-pink-400"
          } hover:bg-pink-500 transition`}
        >
          {selectedLabel ? "Désactiver Skeleton" : "Activer Skeleton"}
        </button>
      </div>
    );
  }