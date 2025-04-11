import { useState, useCallback, useEffect } from "react"; // ajout useCallback 

export function useZoom({ canvasRef, viewerRef }) {
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Fonction pour réinitialiser le zoom
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

    // Fonction pour gérer le zoom avec la molette // Ajout 
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


    // Fonction pour commencer le déplacement (clic droit) // Ajout 
    const handleMouseDown = useCallback((event) => {
        if (event.button === 2) { // Clic droit
            event.preventDefault();
            setIsPanning(true);
            setPanStart({ x: event.clientX, y: event.clientY });
        }
    }, []);

    // Fonction pour effectuer le déplacement
    const handleMouseMove = useCallback((event) => {
        if (isPanning) {
            const dx = (event.clientX - panStart.x) / zoom; // ajout diviser par zoom pour rescale les coordonnées dans le JSON 
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

    // Fonction pour convertir les coordonnées d'écran en coordonnées réelles
    const screenToImageCoords = useCallback((screenX, screenY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: screenX, y: screenY };
        
        const rect = canvas.getBoundingClientRect();
        
        // Convertir les coordonnées d'écran en coordonnées de canvas
        const canvasX = (screenX - rect.left) * (canvas.width / rect.width);
        const canvasY = (screenY - rect.top) * (canvas.height / rect.height);
        
        // Appliquer la transformation inverse du zoom et du déplacement
        const imageX = canvasX / zoom - panOffset.x;
        const imageY = canvasY / zoom - panOffset.y;
        
        return { x: imageX, y: imageY };
    }, [zoom, panOffset]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const viewer = viewerRef.current;
        
        if (canvas && viewer) {
            // Appliquer les transformations
            canvas.style.transform = `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`;
            viewer.style.transform = `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`;
        }
    }, [zoom, panOffset, canvasRef, viewerRef]);

    // Ajouter les écouteurs d'événements
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Désactiver le menu contextuel pour permettre le clic droit
        const handleContextMenu = (e) => e.preventDefault();
        
        canvas.addEventListener('wheel', handleZoom, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('contextmenu', handleContextMenu);
        
        return () => {
            canvas.removeEventListener('wheel', handleZoom);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);
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