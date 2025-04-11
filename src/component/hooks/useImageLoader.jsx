import { useState, useCallback } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

export function useImageLoader({ viewerRef, canvasRef }) {
    const [dicomLoaded, setDicomLoaded] = useState(false);
    const [images, setImages] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const adjustCanvasSize = (imageWidth, imageHeight) => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
        }
    };

    const loadDicomImage = async (imageId, callback) => {
        try {
            const element = viewerRef.current;
            cornerstone.enable(element);
    
            const image = await cornerstone.loadImage(imageId);
            cornerstone.displayImage(element, image);
            setDicomLoaded(true);
    
            adjustCanvasSize(image.width, image.height);
            if (callback) setTimeout(callback, 50);
        } catch (error) {
            console.error("Erreur lors du chargement de l'image DICOM :", error);
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
            setDicomLoaded(true);
    
            adjustCanvasSize(imgElement.naturalWidth, imgElement.naturalHeight);
            if (callback) setTimeout(callback, 50);
        };
    };
    
    const loadImage = useCallback((imageData, callback) => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    
        if (imageData.type === "dicom") {
            loadDicomImage(imageData.url, callback);
        } else if (imageData.type === "image") {
            loadStandardImage(imageData.url, callback);
        }
    }, [canvasRef, viewerRef]);

    const processFiles = useCallback((files) => {
        if (files.length === 0) return;

        const imageFiles = [];
        let filesProcessed = 0;

        files.forEach((file) => {
            if (file.type === "application/dicom" || file.name.endsWith(".dcm")) {
                const fileReader = new FileReader();
                fileReader.onload = function (e) {
                    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                    imageFiles.push({ type: "dicom", url: imageId, name: file.name });
                    
                    filesProcessed++;
                    if (filesProcessed === files.length) {
                        setImages(prevImages => [...prevImages, ...imageFiles]);
                        if (imageFiles.length > 0) {
                            loadImage(imageFiles[0]);
                        }
                    }
                };
                fileReader.readAsArrayBuffer(file);
            } else if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                imageFiles.push({ type: "image", url, name: file.name });
                
                filesProcessed++;
                if (filesProcessed === files.length) {
                    setImages(prevImages => [...prevImages, ...imageFiles]);
                    if (imageFiles.length > 0) {
                        loadImage(imageFiles[0]);
                    }
                }
            } else {
                filesProcessed++;
                 if (filesProcessed === files.length && imageFiles.length > 0) {
                        setImages(prevImages => [...prevImages, ...imageFiles]);
                        loadImage(imageFiles[0]);
                 }
            }
        });
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
        dicomLoaded,
        isDraggingOver,
        handleFileChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        loadImage,
        adjustCanvasSize
    };
}