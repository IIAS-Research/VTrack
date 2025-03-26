import { useState, useEffect, useCallback } from "react";

export function useKeypoints({ canvasRef, currentPage, selectedLabel, keypointSize }) {
    const [keypoints, setKeypoints] = useState({});

    console.log('setKeypoints in useKeypoints:', setKeypoints);

    const colors = {
        ICA: "#FFADAD",  // Rouge pastel
        MCA1: "#9BB1FF", // Bleu pastel
        MCA2: "#A0E7E5", // Turquoise pastel
        MCA3: "#FFD6A5", // Orange pastel
        PCA1: "#D4A5A5", // Rose pastel
        PCA2: "#C6A2FC", // Violet pastel
        PCA3: "#FFB5E8", // Rose plus vif
        BA: "#A7E9AF",   // Vert pastel
        ACA1: "#FBE7C6", // Jaune pastel
        ACA2: "#B5EAD7", // Menthe pastel
        ACA3: "#E2F0CB", // Vert clair
        SCA: "#AFCBFF",  // Bleu ciel
        PCA: "#E4C1F9",  // Mauve clair
        PCOM: "#C3B1E1", // Lilas pastel
        VA: "#FFCBCB"    // Rose clair
    };
    // const colors = {
        // ICA: "red", MCA1: "blue", MCA2: "green", MCA3: "yellow",
        // PCA1: "purple", PCA2: "orange", PCA3: "pink", BA: "cyan",
        // ACA1: "lime", ACA2: "brown", ACA3: "magenta", SCA: "teal",
        // PCA: "gold", PCOM: "navy", VA: "coral"
    // };

    const handleCanvasClick = (event) => {
        if (!selectedLabel) return; // Ne pas tracer ni enregistrer de keypoints si aucun label n'est sélectionné

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();

        // Calculer le ratio entre la taille réelle du canvas et sa taille affichée
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Obtenir les coordonnées du clic par rapport au canvas
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Convertir en coordonnées d'image en tenant compte du ratio
        const x = clickX * scaleX;
        const y = clickY * scaleY;

        const newKeypoints = { ...keypoints };
        if (!newKeypoints[currentPage]) {
            newKeypoints[currentPage] = [];
        }

        const currentKeypoints = newKeypoints[currentPage];
        const lastKeypointOfSameLabel = currentKeypoints.filter(kp => kp.label === selectedLabel).slice(-1)[0];
        const parent = lastKeypointOfSameLabel ? lastKeypointOfSameLabel : null;

        newKeypoints[currentPage].push({ x, y, label: selectedLabel, parent });
        setKeypoints(newKeypoints);
    };

    const drawKeypoints = (pageToRender) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
    
        // Effacer le canvas avant de redessiner
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw keypoints only for the specified page or current page
        const pageNumber = pageToRender || currentPage;
        const currentKeypoints = keypoints[pageNumber] || [];
        
        currentKeypoints.forEach(({ x, y, label, parent }) => {
            ctx.fillStyle = colors[label];
            ctx.beginPath();
            ctx.arc(x, y, keypointSize, 0, 2 * Math.PI);
            ctx.fill();
            
            if (parent && parent.label === label) {
                ctx.strokeStyle = colors[label];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(parent.x, parent.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        });
    };    


    const screenToImageCoords = useCallback((screenX, screenY) => { // Ajout 
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        
        // Calculer le ratio entre la taille réelle du canvas et sa taille affichée
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Convertir en coordonnées d'image
        const x = (screenX - rect.left) * scaleX;
        const y = (screenY - rect.top) * scaleY;
        
        return { x, y };
    }, []);

    useEffect(() => {
        drawKeypoints();
    }, [keypoints, currentPage, keypointSize]);

    const resetKeypoints = () => {
        const newKeypoints = { ...keypoints };
        delete newKeypoints[currentPage];
        setKeypoints(newKeypoints);
        clearCanvas();
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return {
        keypoints,
        handleCanvasClick,
        drawKeypoints,
        colors,
        setKeypoints,
        screenToImageCoords,
        clearCanvas,
        resetKeypoints
    };
}