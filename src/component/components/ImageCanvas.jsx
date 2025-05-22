import React, { useState, useEffect } from "react";

function ImageCanvas({ viewerRef, canvasRef, handleCanvasClick }) {
    const [imageBounds, setImageBounds] = useState(null);
    
    // Fonction pour vérifier si un clic est à l'intérieur de l'image
    const isClickInsideImage = (clientX, clientY) => {
        const img = viewerRef.current?.querySelector('img');
        if (!img) return false;
        
        const rect = img.getBoundingClientRect();
        return (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
        );
    };

    // Fonction pour convertir les coordonnées du canvas en coordonnées de l'image originale
    const convertCanvasToImageCoords = (clientX, clientY) => {
        const img = viewerRef.current?.querySelector('img');
        const canvas = canvasRef.current;
        
        if (!img || !canvas) return { x: 0, y: 0 };
        
        const canvasRect = canvas.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        // Calculer le ratio entre la taille affichée et la taille naturelle
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;
        
        // Convertir les coordonnées du clic en coordonnées relatives à l'image
        const x = (clientX - imgRect.left) * scaleX;
        const y = (clientY - imgRect.top) * scaleY;
        
        return { x, y };
    };

    // Intercepter le clic et vérifier s'il est dans l'image
    const handleClick = (event) => {
        if (isClickInsideImage(event.clientX, event.clientY)) {
            const { x, y } = convertCanvasToImageCoords(event.clientX, event.clientY);
            
            // Créer un nouvel événement avec les coordonnées transformées
            const newEvent = {
                ...event,
                originalX: x,
                originalY: y,
                convertedCoords: true
            };
            
            handleCanvasClick(newEvent);
        }
    };

    // Surveiller les changements d'image
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const img = viewerRef.current?.querySelector('img');
            if (img) {
                const rect = img.getBoundingClientRect();
                setImageBounds({
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                });
            }
        });
        
        if (viewerRef.current) {
            observer.observe(viewerRef.current, { childList: true, subtree: true });
        }
        
        return () => observer.disconnect();
    }, [viewerRef]);

    return (
        <div className="relative max-w-full border rounded shadow-md">
            <div ref={viewerRef} className="w-full h-full"></div>
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                onClick={handleClick}
            />
        </div>
    );
}

export default ImageCanvas;