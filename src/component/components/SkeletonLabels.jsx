import React from "react";

// export function SkeletonLabels({ title, colors, selectedLabel, setSelectedSkeletonLabel }) {
    // return (
        // <div className="flex flex-col bg-slate-50 rounded p-2">
            {/* <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">{title}</h4> */}
            {/* {Object.keys(colors).map(label => ( */}
                // <button
                    // key={label}
                    // onClick={() => setSelectedSkeletonLabel(label)}
                    // className={`mb-1 px-2 py-1 rounded text-sm ${selectedLabel === label ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-500'}`}
                // >
                    {/* {label} */}
                {/* </button> */}
            // ))}
            {/* <button */}
                // onClick={() => setSelectedSkeletonLabel(null)}
                // className={` mb-1 px-2 py-1 rounded ${selectedLabel === null ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-500'}`}
            // >
                {/* None */}
            {/* </button> */}
        {/* </div> */}
    // );
// }

export function SkeletonLabels({ selectedLabel, setSelectedSkeletonLabel }) {
    const toggleSkeletonMode = () => {
        // Toggle on/off
        setSelectedSkeletonLabel(prev => prev ? null : 'skeleton');
    };

    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={toggleSkeletonMode}
                className={`rounded px-4 py-2 text-white ${selectedLabel ? 'bg-indigo-600' : 'bg-indigo-400'} hover:bg-indigo-700`}
            >
                {selectedLabel ? "Désactiver Skeleton" : "Activer Skeleton"}
            </button>
        </div>
    );
}
