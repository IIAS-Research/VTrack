import React from "react";

export function VesselLabels({ title, colors, selectedLabel, setSelectedLabel }) {
    const bifurcationLabels = [
        "Bifurcation carotidienne",
        "MCA1 -> MCA2",
        "MCA2 -> MCA3",
        "ACA1 -> ACA2",
        "ACA2 -> ACA3",
        "PCA1 -> PCA2",
        "PCA2 -> PCA3"
    ];

    const vesselLabels = Object.keys(colors)
        .filter(label => !bifurcationLabels.includes(label))
        .filter(label => label !== "Occlusion");

    return (
        <div className="... w-full ...">
            <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">{title}</h4>

            {/* Grille horizontale */}
            <div className="flex flex-row gap-4 justify-between">
                {/* Colonne Vaisseaux */}
                <div className="flex-1">
                    <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">Vaisseaux</h5>
                    {vesselLabels.map(label => (
                        <button
                            key={label}
                            onClick={() => setSelectedLabel(label)}
                            className={`mb-1 px-2 py-1 rounded text-sm w-full ${selectedLabel === label ? 'ring-2 ring-indigo-500' : ''}`}
                            style={{
                                backgroundColor: colors[label],
                                color: `color-mix(in srgb, ${colors[label]} 60%, black)`
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Colonne Bifurcations */}
                <div className="flex-1">
                    <h5 className="text-sm font-semibold mb-1 text-slate-600 text-center">Bifurcations</h5>
                    {bifurcationLabels.map(label => (
                        <button
                            key={label}
                            onClick={() => setSelectedLabel(label)}
                            className={`mb-1 px-2 py-1 rounded text-sm w-full ${selectedLabel === label ? 'ring-2 ring-pink-500' : ''}`}
                            style={{
                                backgroundColor: colors[label],
                                color: `color-mix(in srgb, ${colors[label]} 60%, black)`
                            }}
                        >
                            🔀 {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bouton None */}
            <button
                onClick={() => setSelectedLabel(null)}
                className={`mt-2 px-2 py-1 rounded w-full ${selectedLabel === null ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-500'}`}
            >
                Aucune sélection
            </button>
        </div>
    );
}