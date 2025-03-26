import { useRef, useState, useEffect } from "react";
import { initializeCornerstoneTools } from "./components/cornerstoneSetup";
import { useImageLoader } from "./hooks/useImageLoader";
import { useKeypoints } from "./hooks/useKeypoints";
import { useSkeletons } from "./hooks/useSkeletons";
import { useZoom } from "./hooks/useZoom";
import { VesselLabels } from "./components/VesselLabels";
import { SkeletonLabels } from "./components/SkeletonLabels";
import { ImageNavigator } from "./components/imageNavigator";
import { ZoomControls } from "./components/ZoomControls";

export default function DicomAnnotator() {
    // Initialize refs
    const fileInputRef = useRef(null);
    const viewerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Initialize state
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKeypointLabel, setSelectedKeypointLabel] = useState(null);
    const [selectedSkeletonLabel, setSelectedSkeletonLabel] = useState(null);
    const [keypointSize, setKeypointSize] = useState(5); // Default keypoint size
    
    // Initialize Cornerstone
    initializeCornerstoneTools();
    
    // Custom hooks for functionality
    const { 
        images, 
        dicomLoaded, 
        handleFileChange, 
        loadImage,
        adjustCanvasSize
    } = useImageLoader({ viewerRef, canvasRef });
    
    const {
        keypoints,
        handleCanvasClick: handleKeypointClick,
        drawKeypoints,
        colors: keypointColors,
        setKeypoints
    } = useKeypoints({ canvasRef, currentPage, selectedLabel: selectedKeypointLabel, keypointSize });
    
    const {
        skeletons,
        handleCanvasClick: handleSkeletonClick,
        drawSkeletons,
        colors: skeletonColors,
        setSkeletons
    } = useSkeletons({ canvasRef, currentPage, selectedLabel: selectedSkeletonLabel, keypoints, setKeypoints });
    
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
                parent: parent ? keypoints[currentPage].indexOf(parent) : null
            })) : []
        }, null, 2);
        
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentImage.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
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

    // Draw both keypoints and skeletons
    const drawAll = (page) => {
        clearCanvas();
        drawKeypoints(page);
        drawSkeletons(page);
    };

    useEffect(() => {
        drawAll(currentPage);
    }, [keypoints, skeletons, currentPage]);

    useEffect(() => {
        drawAll(currentPage);
    }, [keypointSize]);

    // Functions to reset keypoints and skeletons
    const resetKeypoints = () => {
        console.log('Keypoints avant réinitialisation:', keypoints);
        const newKeypoints = { ...keypoints };
        delete newKeypoints[currentPage];
        console.log('setKeypoints:', setKeypoints);
        setKeypoints(newKeypoints);
        clearCanvas();
        console.log('Keypoints après réinitialisation:', newKeypoints);
    };

    const resetSkeletons = () => {
        const newSkeletons = { ...skeletons };
        delete newSkeletons[currentPage];
        setSkeletons(newSkeletons);
        clearCanvas();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className="p-4 mt-16 flex gap-4">
            {/* Left panel - Image viewer */}
            <div className="w-2/3 flex flex-col items-center rounded p-4 bg-white border border-slate-200 shadow-md">
                <input
                    type="file"
                    accept=".dcm,.png,.jpg,.jpeg,.gif,.bmp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="mb-4"
                    multiple
                />
                <div className="relative max-w-full border rounded shadow-md overflow-hidden">
                    {/* Zoom Instructions */}
                    {showInstructions && dicomLoaded && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-indigo-700 bg-opacity-90 text-white p-2 rounded z-20 text-sm">
                            <p>⚙️ Ctrl + Roulette = Zoom | Ctrl + Click = Pan | Utilisez les contrôles en haut à droite</p>
                            <button 
                                className="absolute top-1 right-1 text-xs"
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
                        onClick={(e) => {
                            handleKeypointClick(e);
                            handleSkeletonClick(e);
                        }}
                        style={{ transformOrigin: '0 0' }}
                    />
                </div>
                {!dicomLoaded && <p className="mt-2">Sélectionne un fichier DICOM ou image</p>}
            </div>
            
            {/* Right panel - Tools */}
            <div className="w-1/3 flex flex-col rounded p-4 h-fit bg-white border border-slate-200 shadow-md">
                <h3 className="text-center text-2xl font-bold border-b mb-2 pb-2 text-indigo-700">Tools</h3>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <VesselLabels 
                        title="Vessels - Keypoints"
                        colors={keypointColors}
                        selectedLabel={selectedKeypointLabel}
                        setSelectedLabel={handleKeypointLabelSelect}
                    />
                    <SkeletonLabels 
                        title="Vessels - Skeletons"
                        colors={skeletonColors}
                        selectedLabel={selectedSkeletonLabel}
                        setSelectedSkeletonLabel={handleSkeletonLabelSelect}
                    />
                </div>
                <div className="w-full bg-slate-50 rounded p-2 mb-4">
                    <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">Custom Tools</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {/* Reset Keypoints */}
                        <button 
                            onClick={resetKeypoints}
                            className="bg-indigo-500 text-white rounded p-2 text-sm"
                        >
                            Reset Keypoints
                        </button>
                        {/* Reset Skeletons */}
                        <button 
                            onClick={resetSkeletons}
                            className="bg-indigo-500 text-white rounded p-2 text-sm"
                        >
                            Reset Skeletons
                        </button>
                        {/* Keypoint Size Controls */}
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setKeypointSize(size => {
                                    const newSize = Math.max(size - 1, 1);
                                    drawAll(currentPage);
                                    return newSize;
                                })}
                                className="bg-indigo-500 text-white rounded p-2 text-sm"
                            >
                                Decrease Keypoint Size
                            </button>
                            <span className="text-sm">{keypointSize}px</span>
                            <button 
                                onClick={() => setKeypointSize(size => {
                                    const newSize = size + 1;
                                    drawAll(currentPage);
                                    return newSize;
                                })}
                                className="bg-indigo-500 text-white rounded p-2 text-sm"
                            >
                                Increase Keypoint Size
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-slate-50 rounded p-2">
                    <h4 className="text-lg font-bold mb-2 text-center text-indigo-500">Zoom & Pan</h4>
                    <div className="flex items-center justify-center mb-2">
                        {dicomLoaded && (
                            <ZoomControls 
                                zoom={zoom}
                                zoomIn={zoomIn}
                                zoomOut={zoomOut}
                                resetZoom={resetZoom}
                                panEnabled={panEnabled}
                                setPanEnabled={setPanEnabled}
                            />
                        )}
                    </div>
                </div>
                {/* Image Navigator */}
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
    );
}