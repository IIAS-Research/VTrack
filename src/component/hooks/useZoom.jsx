// Hook for managing zoom and pan functionality
// Provides zoom in/out, pan controls, and coordinate transformation
import { useState, useCallback, useEffect } from "react";

// useZoom - Handles image zoom and panning with proper coordinate conversion
export function useZoom({ canvasRef, viewerRef }) {
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Function to reset zoom
    const resetZoom = useCallback(() => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    // Fonctions pour zoomer manuellement
    const zoomIn = useCallback(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const zoomFactor = 1.1;
        const newZoom = Math.min(zoom * zoomFactor, 5);

        const viewerCenterX = viewer.offsetWidth / 2;
        const viewerCenterY = viewer.offsetHeight / 2;

        // Calculate the new pan offset to keep the center point stable
        const newPanOffsetX = panOffset.x + viewerCenterX * (1/newZoom - 1/zoom);
        const newPanOffsetY = panOffset.y + viewerCenterY * (1/newZoom - 1/zoom);

        setZoom(newZoom);
        setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });

    }, [zoom, panOffset, viewerRef]);

    const zoomOut = useCallback(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const zoomFactor = 1.1;
        const newZoom = Math.max(zoom / zoomFactor, 0.5);

        const viewerCenterX = viewer.offsetWidth / 2;
        const viewerCenterY = viewer.offsetHeight / 2;

        // Calculate the new pan offset to keep the center point stable
        const newPanOffsetX = panOffset.x + viewerCenterX * (1/newZoom - 1/zoom);
        const newPanOffsetY = panOffset.y + viewerCenterY * (1/newZoom - 1/zoom);
        
        setZoom(newZoom);
        setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });

    }, [zoom, panOffset, viewerRef]);

    // Function to handle scroll wheel zoom
    const handleZoom = useCallback((event) => {
        event.preventDefault();
        
        const delta = -Math.sign(event.deltaY);
        
        if (delta > 0) {
            zoomIn(); // Simulate click on zoom in
        } else if (delta < 0) {
            zoomOut(); // Simulate click on zoom out
        }
        // Removed previous complex zoom logic
    }, [zoomIn, zoomOut]); // Depend on zoomIn and zoomOut


    // Function to start pan (right-click)
    const handleMouseDown = useCallback((event) => {
        if (event.button === 2) { // Right-click
            event.preventDefault();
            setIsPanning(true);
            setPanStart({ x: event.clientX, y: event.clientY });
        }
    }, []);

    // Function to perform pan
    const handleMouseMove = useCallback((event) => {
        if (isPanning) {
            const dx = (event.clientX - panStart.x) / zoom; // Divide by zoom to rescale coordinates
            const dy = (event.clientY - panStart.y) / zoom;
            
            setPanOffset({
                x: panOffset.x + dx,
                y: panOffset.y + dy
            });
            
            setPanStart({ x: event.clientX, y: event.clientY });
        }
    }, [isPanning, panStart, panOffset, zoom]);

    const handleMouseUp = useCallback(() => { // useCallback
        setIsPanning(false);
    }, []);

    // Function to convert screen coordinates to real coordinates
    const screenToImageCoords = useCallback((screenX, screenY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: screenX, y: screenY };
        
        const rect = canvas.getBoundingClientRect();
        
        // Convert screen coordinates to canvas coordinates
        const canvasX = (screenX - rect.left) * (canvas.width / rect.width);
        const canvasY = (screenY - rect.top) * (canvas.height / rect.height);
        
        // Apply inverse transformation of zoom and pan
        const imageX = canvasX / zoom - panOffset.x;
        const imageY = canvasY / zoom - panOffset.y;
        
        return { x: imageX, y: imageY };
    }, [zoom, panOffset]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const viewer = viewerRef.current;
        
        if (canvas && viewer) {
            // Apply transformations
            canvas.style.transform = `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`;
            viewer.style.transform = `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`;
        }
    }, [zoom, panOffset, canvasRef, viewerRef]);

    // Add event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Disable context menu to allow right-click
        const handleContextMenu = (e) => e.preventDefault();
        
        const canvas_parent = canvas.parentElement;
        canvas_parent.addEventListener('wheel', handleZoom, { passive: false });
        canvas_parent.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas_parent.addEventListener('contextmenu', handleContextMenu);
        
        return () => {
            canvas_parent.removeEventListener('wheel', handleZoom);
            canvas_parent.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas_parent.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleZoom, handleMouseDown, handleMouseMove, handleMouseUp, canvasRef]);

    return {
        zoom,
        panOffset,
        resetZoom,
        zoomIn,
        zoomOut,
        screenToImageCoords
    };
}