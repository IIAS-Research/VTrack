// Component for selecting skeleton annotation mode
// Toggles skeleton (line) drawing functionality

// SkeletonLabels - UI button for activating skeleton annotation mode
export function SkeletonLabels({ title, colors, selectedLabel, setSelectedLabel }) {
    return (
        <div className="flex flex-col items-center w-full">
            {title && <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">{title}</h5>}
            <button
                onClick={() => setSelectedLabel("Skeleton")}
                className={`px-3 py-1 rounded ${
                    selectedLabel === "Skeleton"
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{ border: `2px solid ${colors["Skeleton"]}` }}
            >
                Skeleton
            </button>
        </div>
    );
}