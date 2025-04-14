import { useState, useCallback } from "react";
import UTIF from 'utif';

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

    const convertTiffToPng = async (file) => {
        try {
            const buffer = await file.arrayBuffer();
            const ifds = UTIF.decode(buffer);

            if (!ifds || ifds.length === 0) {
                console.error("Could not decode TIFF file:", file.name);
                return null;
            }
            
            const firstImage = ifds[0]; 
            UTIF.decodeImage(buffer, firstImage);
            const rgba = UTIF.toRGBA8(firstImage);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = firstImage.width;
            tempCanvas.height = firstImage.height;
            const ctx = tempCanvas.getContext('2d');

            const imageData = ctx.createImageData(firstImage.width, firstImage.height);
            imageData.data.set(rgba); 

            ctx.putImageData(imageData, 0, 0);

            const pngUrl = tempCanvas.toDataURL('image/png');
            return { 
                type: "image/png", 
                url: pngUrl, 
                name: file.name.replace(/\.(tif|tiff)$/i, '.png') 
            };
        } catch (error) {
            console.error("Error processing TIFF file:", file.name, error);
            return null;
        }
    };

    const processFiles = useCallback(async (files) => {
        const imageFiles = [];

        for (const file of files) {
            if (file.type === "image/tiff") {
                const pngFile = await convertTiffToPng(file);
                if (pngFile) {
                    imageFiles.push(pngFile);
                }
            } else if (file.type.startsWith("image/")) {
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