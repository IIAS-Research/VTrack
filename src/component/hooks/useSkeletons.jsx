import { useState, useEffect } from "react";

export function useSkeletons({ canvasRef, currentPage, selectedLabel, keypoints, setKeypoints }) {
    const [skeletons, setSkeletons] = useState({});
    const [startPoint, setStartPoint] = useState(null);

    const colors = {
        ICA: "red", MCA1: "blue", MCA2: "green", MCA3: "yellow",
        PCA1: "purple", PCA2: "orange", PCA3: "pink", BA: "cyan",
        ACA1: "lime", ACA2: "brown", ACA3: "magenta", SCA: "teal",
        PCA: "gold", PCOM: "navy", VA: "coral"
    };

    const handleCanvasClick = (event) => {
        if (!selectedLabel) return; // Ne pas tracer ni enregistrer de skeletons si aucun label n'est sélectionné

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Get current transformation matrix to account for zoom/pan
        const transform = canvas.style.transform || '';
        let zoomScale = 1;
        if (transform.includes('scale')) {
            const scaleMatch = transform.match(/scale\(([^)]+)\)/);
            if (scaleMatch && scaleMatch[1]) {
                zoomScale = parseFloat(scaleMatch[1]);
            }
        }
        
        // Calculate translated position with zoom taken into account
        const x = (event.clientX - rect.left) * scaleX / zoomScale;
        const y = (event.clientY - rect.top) * scaleY / zoomScale;

        const currentKeypoints = keypoints[currentPage] || [];
        const findClosestKeypoint = (x, y) => {
            let closestKeypoint = null;
            let minDistance = Infinity;
            currentKeypoints.forEach(kp => {
                const distance = Math.sqrt((kp.x - x) ** 2 + (kp.y - y) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestKeypoint = kp;
                }
            });
            return closestKeypoint;
        };

        if (!startPoint) {
            const closestKeypoint = findClosestKeypoint(x, y);
            if (closestKeypoint) {
                setStartPoint({ x: closestKeypoint.x, y: closestKeypoint.y, label: closestKeypoint.label });
            }
        } else {
            const closestKeypoint = findClosestKeypoint(x, y);
            if (closestKeypoint) {
                const newSkeletons = { ...skeletons };
                if (!newSkeletons[currentPage]) {
                    newSkeletons[currentPage] = [];
                }

                newSkeletons[currentPage].push({ 
                    x1: startPoint.x, 
                    y1: startPoint.y, 
                    label1: startPoint.label, 
                    x2: closestKeypoint.x, 
                    y2: closestKeypoint.y, 
                    label2: closestKeypoint.label 
                });

                // Update the parent of the second keypoint only if its parent is null
                const newKeypoints = { ...keypoints };
                const secondKeypointIndex = currentKeypoints.findIndex(kp => kp.x === closestKeypoint.x && kp.y === closestKeypoint.y && kp.label === closestKeypoint.label);
                const firstKeypointIndex = currentKeypoints.findIndex(kp => kp.x === startPoint.x && kp.y === startPoint.y && kp.label === startPoint.label);
                if (secondKeypointIndex !== -1 && firstKeypointIndex !== -1 && !newKeypoints[currentPage][secondKeypointIndex].parent) {
                    newKeypoints[currentPage][secondKeypointIndex].parent = newKeypoints[currentPage][firstKeypointIndex];
                    setKeypoints(newKeypoints);
                }

                setSkeletons(newSkeletons);
                setStartPoint(null);
                drawSkeletons(currentPage); // Draw skeletons after updating
            }
        }
    };

    const drawSkeletons = (pageToRender) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
    
        // Draw skeletons only for the specified page or current page
        const pageNumber = pageToRender || currentPage;
        const currentSkeletons = skeletons[pageNumber] || [];
        
        currentSkeletons.forEach(({ x1, y1, label1, x2, y2, label2 }) => {
            ctx.strokeStyle = colors[label2];
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    };    

    useEffect(() => {
        drawSkeletons(currentPage);
    }, [skeletons, currentPage]);

    return {
        skeletons,
        handleCanvasClick,
        drawSkeletons,
        colors,
        setSkeletons
    };
}
