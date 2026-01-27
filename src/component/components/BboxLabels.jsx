// Component for selecting bounding box annotation types
// Supports Occlusion and Hide Region labels

// BboxLabels - UI for selecting bounding box annotation types
export function BboxLabels({ title, colors, selectedLabel, setSelectedLabel }) {
    const labels = ["Occlusion", 
                    "Hide Region"];

    return (
        <div className="flex flex-col items-center w-full">
            {title && <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">{title}</h5>}

            <div className="flex flex-col gap-2 w-full">
                {labels.map(label => (
                    <button
                        key={label}
                        onClick={() => setSelectedLabel(label)}
                        className={`px-3 py-1 rounded text-sm font-medium w-full text-center ${
                            selectedLabel === label
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={{ border: `2px solid ${colors[label]}` }}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}