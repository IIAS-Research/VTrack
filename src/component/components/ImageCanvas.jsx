import React from "react";

function ImageCanvas({ viewerRef, canvasRef, handleCanvasClick }) {
    return (
        <div className="relative max-w-full border rounded shadow-md">
            <div ref={viewerRef} className="w-full h-full"></div>
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                onClick={handleCanvasClick}
            />
        </div>
    );
}

export default ImageCanvas;