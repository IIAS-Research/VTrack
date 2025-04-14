import { useState, useCallback } from "react";

export function useImageLoader({ viewerRef, canvasRef }) {
    const [images, setImages] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const adjustCanvasSize = (imageWidth, imageHeight) => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
        }
    };

    const loadStandardImage = (url, callback) => {
        if (viewerRef.current && viewerRef.current.hasChildNodes()) {
            viewerRef.current.innerHTML = '';
        }
    
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.style.objectFit = 'contain';
    
        imgElement.onload = () => {
            viewerRef.current.appendChild(imgElement);
    
            adjustCanvasSize(imgElement.naturalWidth, imgElement.naturalHeight);
            if (callback) setTimeout(callback, 50);
        };
    };
    
    const loadImage = useCallback((imageData, callback) => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    
        loadStandardImage(imageData.url, callback);
    }, [canvasRef, viewerRef]);

    const processFiles = useCallback((files) => {
        const imageFiles = [];

        for (const file of files) {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                imageFiles.push({ type: "image", url, name: file.name });
            }
        }

        if (imageFiles.length > 0) {
            setImages(prev => [...prev, ...imageFiles]);
            loadImage(imageFiles[0]);
        }
    }, [loadImage]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        processFiles(files);
    };

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);

        const files = Array.from(event.dataTransfer.files);
        processFiles(files);
    }, [processFiles]);

    return {
        images,
        isDraggingOver,
        handleFileChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        loadImage,
        adjustCanvasSize
    };
}