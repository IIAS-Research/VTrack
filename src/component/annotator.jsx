import { useRef, useState, useEffect } from "react";
import { initializeCornerstoneTools } from "./components/cornerstoneSetup";
import { useImageLoader } from "./hooks/useImageLoader";
import { useZoom } from "./hooks/useZoom";
import { VesselLabels } from "./components/VesselLabels";
import { SkeletonLabels } from "./components/SkeletonLabels";
import { BboxLabels } from "./components/BboxLabels";
import { ImageNavigator } from "./components/ImageNavigator";
import { ZoomControls } from "./components/ZoomControls";
import { useAnnotations } from "./hooks/useAnnotations";
import { Undo2 } from "lucide-react";
// import { colors } from "cornerstone-core";

export default function DicomAnnotator() {
    // Initialize refs
    const fileInputRef = useRef(null);
    const viewerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Initialize state
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKeypointLabel, setSelectedKeypointLabel] = useState(null);
    const [selectedSkeletonLabel, setSelectedSkeletonLabel] = useState(null);
    const [selectedBboxLabel, setSelectedBboxLabel] = useState(null);
    const [keypointSize, setKeypointSize] = useState(5); // Default keypoint size
    
    // Initialize Cornerstone
    initializeCornerstoneTools();
    
    // Custom hooks for functionality
    const { 
        images, 
        dicomLoaded, 
        isDraggingOver,
        handleFileChange, 
        handleDragOver,
        handleDragLeave,
        handleDrop,
        loadImage,
        adjustCanvasSize
    } = useImageLoader({ viewerRef, canvasRef });
    
    const {
        keypoints,
        skeletons,
        bboxes,
        handleCanvasClick,
        handleMouseMove,
        drawAll,
        resetKeypoints,
        resetSkeletons,
        resetBboxes,
        undoLastKeypoint,
        undoLastSkeleton,
        undoLastBbox,
        colors,
        setKeypoints,
        setSkeletons,
        setBboxes
    } = useAnnotations({ 
        canvasRef, 
        currentPage, 
        keypointSize, 
        selectedKeypointLabel, 
        selectedSkeletonLabel,
        selectedBboxLabel
    });

    // Zoom functionality
    const {
        zoom,
        panOffset,
        resetZoom,
        zoomIn,
        zoomOut,
        screenToImageCoords
    } = useZoom({ canvasRef, viewerRef });
    
    // State for pan mode
    const [panEnabled, setPanEnabled] = useState(false);

    // Navigation handlers
    const handleNextPage = () => {
        if (currentPage < images.length) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            
            // Reset zoom when changing pages
            resetZoom();
            
            loadImage(images[nextPage - 1], () => {
                // Callback after image is loaded and canvas size is adjusted
                drawAll(nextPage);
            });
        }
    };
    
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            
            // Reset zoom when changing pages
            resetZoom();
            
            loadImage(images[prevPage - 1], () => {
                // Callback after image is loaded and canvas size is adjusted
                drawAll(prevPage);
            });
        }
    };
    
    // Handle Bbox label selection
    const handleBboxLabelSelect = (label) => {
        setSelectedBboxLabel(label);
        setSelectedKeypointLabel(null);
        setSelectedSkeletonLabel(null);
    };

    // Save JSON handler
    const handleSaveJSON = () => {
        if (images.length === 0 || !dicomLoaded) return;
        
        const currentImage = images[currentPage - 1];
        const canvas = canvasRef.current;
        
        const json = JSON.stringify({
            filename: currentImage.name,
            width: canvas.width,
            height: canvas.height,
            vessel: keypoints[currentPage] ? keypoints[currentPage].map(({ x, y, label, parent }, index) => ({
                id: index,
                x, 
                y, 
                label, 
                parent: parent ? 
                    (Array.isArray(parent) ? 
                        parent.map(p => keypoints[currentPage].indexOf(p)) : 
                        keypoints[currentPage].indexOf(parent)) 
                    : null
            })) : [],
            skeleton: skeletons[currentPage] || [],
            bbox: bboxes[currentPage] || []
        }, null, 2);
        
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentImage.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoadJSON = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
    
                if (data.vessel) {
                    const newKeypoints = { ...keypoints };
                    newKeypoints[currentPage] = data.vessel.map(({ x, y, label, parent }, index) => ({
                        x, 
                        y, 
                        label, 
                        parent: parent !== null ? data.vessel[parent] : null
                    }));
                    setKeypoints(newKeypoints);
                }
    
                if (data.skeleton) {
                    const newSkeletons = { ...skeletons };
                    newSkeletons[currentPage] = data.skeleton;
                    setSkeletons(newSkeletons);
                }
    
                drawAll(currentPage);
            } catch (error) {
                console.error("Erreur lors du chargement du JSON :", error);
            }
        };
        reader.readAsText(file);
    };
    

    // Instructions for zoom/pan
    const [showInstructions, setShowInstructions] = useState(true);
    
    // Effect to hide instructions after 10 seconds
    useEffect(() => {
        if (showInstructions) {
            const timer = setTimeout(() => {
                setShowInstructions(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [showInstructions]);

    // Handle skeleton label selection
    const handleSkeletonLabelSelect = (label) => {
        setSelectedSkeletonLabel(label);
        setSelectedKeypointLabel(null); // Deselect keypoints when a skeleton is selected
    };

    // Handle keypoint label selection
    const handleKeypointLabelSelect = (label) => {
        setSelectedKeypointLabel(label);
        setSelectedSkeletonLabel(null); // Deselect skeletons when a keypoint is selected
    };

    useEffect(() => {
        drawAll(currentPage);
    }, [keypoints, skeletons, currentPage]);

    useEffect(() => {
        drawAll(currentPage);
    }, [keypointSize]);


    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className="p-6 mt-16 flex flex-col lg:flex-row gap-6">
            {/* Left panel - Action buttons */}
            <div className="w-full lg:w-1/6 flex flex-col card bg-white p-4 rounded-xl h-fit">
                <h3 className="text-center text-xl font-bold mb-3 pb-2 text-indigo-700 border-b border-gray-100">Actions</h3>
                <div className="grid grid-cols-1 gap-2 mb-3">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
                        onClick={resetKeypoints}
                    >
                        <span className="text-white">🗑️</span> Reset Keypoints
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
                        onClick={resetSkeletons}
                    >
                        <span className="text-white">🗑️</span> Reset Skeletons
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
                        onClick={resetBboxes}
                    >
                        <span className="text-white">🗑️</span> Reset Occlusions
                    </button>
                </div>

                {/* Custom Tools - Moved from right panel */}
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-indigo-100 bg-gradient-to-b from-white to-indigo-50 mb-4 mt-2">
                    <h4 className="text-lg font-bold py-2 text-center text-indigo-700 border-b border-indigo-100 bg-white">Custom Tools</h4>
                    <div className="grid grid-cols-1 gap-3 p-4">
                        {/* Undo Last Keypoint */}
                        <button 
                            onClick={undoLastKeypoint}
                            className="bg-amber-500 text-white rounded-lg p-2 text-sm flex items-center justify-center gap-2 w-full hover:bg-amber-600 shadow-sm transition-all duration-200"
                        >
                            <Undo2 size={16} /> 
                            Undo last keypoint
                        </button>
                        {/* Undo Last Skeleton */}
                        <button 
                            onClick={undoLastSkeleton}
                            className="bg-amber-500 text-white rounded-lg p-2 text-sm flex items-center justify-center gap-2 w-full hover:bg-amber-600 shadow-sm transition-all duration-200"
                        >
                            <Undo2 size={16} />
                            Undo last Skeleton
                        </button>

                        {/* Keypoint Size Controls */}
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 mt-2">
                            <button 
                                onClick={() => setKeypointSize(size => {
                                    const newSize = Math.max(size - 1, 1);
                                    drawAll(currentPage);
                                    return newSize;
                                })}
                                className="bg-indigo-500 text-white rounded-lg p-2 text-sm hover:bg-indigo-600 shadow-sm flex-1 mr-2"
                            >
                                Smaller
                            </button>
                            <span className="text-sm font-medium bg-indigo-100 px-3 py-1 rounded-lg">{keypointSize}px</span>
                            <button 
                                onClick={() => setKeypointSize(size => {
                                    const newSize = size + 1;
                                    drawAll(currentPage);
                                    return newSize;
                                })}
                                className="bg-indigo-500 text-white rounded-lg p-2 text-sm hover:bg-indigo-600 shadow-sm flex-1 ml-2"
                            >
                                Larger
                            </button>
                        </div>
                    </div>
                </div>

                {/* Zoom Controls - Moved from right panel */}
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-indigo-100 bg-gradient-to-b from-white to-indigo-50 mb-4">
                    <div className="flex items-center justify-center py-3 bg-white border-b border-indigo-100">
                        {dicomLoaded && (
                            <ZoomControls 
                                zoom={zoom}
                                zoomIn={zoomIn}
                                zoomOut={zoomOut}
                                resetZoom={resetZoom}
                            />
                        )}
                    </div>
                    {/* Load Annotation Button */}
                    <div className="p-4 flex justify-center">
                        <label className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 w-full justify-center">
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={handleLoadJSON} 
                                className="hidden"
                            />
                            <span className="text-xl">📑</span> <span className="font-medium">Load Annotation</span>
                        </label>
                    </div>
                </div>
            </div>
            
            {/* Middle panel - Image viewer */}
            <div 
                className={`w-full lg:w-1/2 flex flex-col transition-all duration-200 ${isDraggingOver ? 'bg-indigo-100 scale-105 shadow-xl' : ''}`}
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={handleDrop}
            >
                <div className="w-full flex flex-col items-center card bg-white p-6 rounded-xl">
                    <label className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200">
                        <input 
                            type="file" 
                            accept=".dcm,.png,.jpg,.jpeg,.gif,.bmp" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            multiple
                        />
                        <span className="text-xl">📂</span> <span className="font-medium">Choose Image</span>
                    </label>
                    {isDraggingOver && (
                        <div className="mt-4 text-center text-indigo-600 font-semibold bg-indigo-50 p-4 rounded-lg w-full border-2 border-dashed border-indigo-400">
                            <p className="text-lg">Drop files here to upload</p>
                        </div>
                    )}
                    <div className="relative w-full mt-4 overflow-hidden rounded-lg shadow-lg border border-gray-100">
                        {/* Zoom Instructions */}
                        {showInstructions && dicomLoaded && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-indigo-800 bg-opacity-90 text-white p-3 rounded-lg z-20 shadow-lg">
                                <p className="flex items-center gap-2 font-medium">
                                    <span className="text-lg">⚙️</span> Ctrl + Mouse Wheel = Zoom | Ctrl + Click = Pan | Use controls in top right
                                </p>
                                <button 
                                    className="absolute top-1 right-1 text-xs bg-indigo-700 hover:bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center"
                                    onClick={() => setShowInstructions(false)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        
                        <div ref={viewerRef} className="w-full h-full" style={{ transformOrigin: '0 0' }}></div>
                        <canvas
                            ref={canvasRef}
                            className={`absolute top-0 left-0 w-full h-full pointer-events-auto ${panEnabled ? 'cursor-grab' : 'cursor-crosshair'}`}
                            onClick={handleCanvasClick}
                            onMouseMove={handleMouseMove}
                            style={{ transformOrigin: '0 0' }}
                        />
                    </div>
                    {!dicomLoaded && !isDraggingOver && (
                        <div className="mt-4 text-center text-gray-500 bg-gray-50 p-4 rounded-lg w-full">
                            <p className="text-lg">Please select a DICOM or image file to begin</p>
                            <p className="text-md text-gray-400">or drag and drop files here</p>
                        </div>
                    )}
                </div>

                {/* Image Navigator */}
                <div className="mt-4 w-full card bg-white p-4 rounded-xl">
                    <ImageNavigator 
                        currentPage={currentPage}
                        imagesLength={images.length}
                        dicomLoaded={dicomLoaded}
                        handlePreviousPage={handlePreviousPage}
                        handleNextPage={handleNextPage}
                        handleSaveJSON={handleSaveJSON}
                    />
                </div>
            </div>
            
            {/* Right panel - Tools */}
            <div className="w-full lg:w-1/3 flex flex-col card bg-white p-6 rounded-xl h-fit">
                <h3 className="text-center text-2xl font-bold mb-4 pb-2 text-indigo-700 border-b border-gray-100">Tools</h3>
                <div className="mb-4 flex flex-col gap-4">
                    {/* Section Vaisseaux */}
                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 bg-gradient-to-b from-white to-gray-50">
                        <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b border-gray-100 pb-2">Vaisseaux</h4>
                        <VesselLabels 
                            title="Keypoints"
                            colors={colors}
                            selectedLabel={selectedKeypointLabel}
                            setSelectedLabel={handleKeypointLabelSelect}
                        />
                    </div>

                    {/* Section Squelettes */}
                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 bg-gradient-to-b from-white to-gray-50">
                        <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b border-gray-100 pb-2">Squelettes</h4>
                        <SkeletonLabels 
                            title="Connexions"
                            colors={colors}
                            selectedLabel={selectedSkeletonLabel}
                            setSelectedLabel={handleSkeletonLabelSelect}
                        />
                    </div>

                    {/* Section Occlusions */}
                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 bg-gradient-to-b from-white to-gray-50">
                        <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b border-gray-100 pb-2">Occlusions</h4>
                        <BboxLabels 
                            title="Occlusions"
                            colors={colors}
                            selectedLabel={selectedBboxLabel}
                            setSelectedLabel={handleBboxLabelSelect}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}