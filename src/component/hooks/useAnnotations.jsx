import { useState, useEffect } from "react";

export function useAnnotations({ canvasRef, currentPage, keypointSize, selectedKeypointLabel, selectedSkeletonLabel, selectedBboxLabel }) {
    const [keypoints, setKeypoints] = useState({});
    const [skeletons, setSkeletons] = useState({});
    const [bboxes, setBboxes] = useState({});
    const [startPoint, setStartPoint] = useState(null);
    const [isDrawingBbox, setIsDrawingBbox] = useState(false);
    const [bboxStart, setBboxStart] = useState(null);

    const colors = {
        ICA: "#FFADAD", MCA1: "#9BB1FF", MCA2: "#A0E7E5", MCA3: "#FFD6A5",
        PCA1: "#D4A5A5", PCA2: "#C6A2FC", PCA3: "#FFB5E8", BA: "#A7E9AF",
        ACA1: "#FBE7C6", ACA2: "#B5EAD7", ACA3: "#E2F0CB", SCA: "#AFCBFF",
        PCA: "#E4C1F9", PCOM: "#C3B1E1", VA: "#FFCBCB",

        "Bifurcation carotidienne": "#FFD700",     // or couleur or
        "MCA1 -> MCA2": "#90EE90",                 // vert clair
        "MCA2 -> MCA3": "#ADD8E6",                 // bleu clair
        "ACA1 -> ACA2": "#FFB347",                 // orange clair
        "ACA2 -> ACA3": "#FF6961",                 // rouge clair
        "PCA1 -> PCA2": "#DDA0DD",                 // violet clair
        "PCA2 -> PCA3": "#87CEEB",                 // bleu ciel
        
        // Couleur pour les Bbox d'occlusion
        "Occlusion": "#FF0000"                     // rouge pour les occlusions
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawKeypoints = (page = currentPage) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const points = keypoints[page] || [];
        points.forEach(({ x, y, label, parent }) => {
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

    const drawSkeletons = (page = currentPage) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const segments = skeletons[page] || [];
        segments.forEach(({ x1, y1, label1, x2, y2, label2 }) => {
            ctx.strokeStyle = colors[label2];
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    };

    const drawBboxes = (page = currentPage) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const boxes = bboxes[page] || [];
        boxes.forEach(({ x1, y1, x2, y2, label }) => {
            ctx.strokeStyle = colors[label];
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            
            // Ajout du label
            ctx.fillStyle = colors[label];
            ctx.font = "12px Arial";
            ctx.fillText(label, x1, y1 - 5);
        });

        // Dessin de la Bbox en cours de création
        if (isDrawingBbox && bboxStart) {
            const startX = bboxStart.x;
            const startY = bboxStart.y;
            const width = bboxStart.width;
            const height = bboxStart.height;
            
            ctx.strokeStyle = colors[selectedBboxLabel];
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        }
    };

    const drawAll = (page = currentPage) => {
        clearCanvas();
        drawKeypoints(page);
        drawSkeletons(page);
        drawBboxes(page);
    };

    const handleCanvasClick = (event) => {
        // Si aucun mode n'est sélectionné, on ne fait rien
        if (!selectedKeypointLabel && !selectedSkeletonLabel && !selectedBboxLabel) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Gestion des keypoints (vaisseaux)
        if (selectedKeypointLabel) {
            const newKeypoints = { ...keypoints };
            if (!newKeypoints[currentPage]) newKeypoints[currentPage] = [];

            const currentList = newKeypoints[currentPage];
            const last = currentList.filter(k => k.label === selectedKeypointLabel).slice(-1)[0];
            const parent = last || null;

            currentList.push({ x, y, label: selectedKeypointLabel, parent });
            setKeypoints(newKeypoints);
            drawAll();
            return;
        }

        // Gestion des squelettes
        if (selectedSkeletonLabel) {
            const kp = keypoints[currentPage] || [];

            const closest = kp.reduce((closest, candidate) => {
                const dist = Math.hypot(candidate.x - x, candidate.y - y);
                if (dist < closest.dist) return { kp: candidate, dist };
                return closest;
            }, { kp: null, dist: Infinity }).kp;

            if (!closest) return;

            if (!startPoint) {
                setStartPoint(closest);
            } else {
                const newSkeletons = { ...skeletons };
                if (!newSkeletons[currentPage]) newSkeletons[currentPage] = [];

                newSkeletons[currentPage].push({
                    x1: startPoint.x, y1: startPoint.y, label1: startPoint.label,
                    x2: closest.x, y2: closest.y, label2: closest.label
                });

                setSkeletons(newSkeletons);
                setStartPoint(null);
                drawAll();
            }
            return;
        }

        // Gestion des Bbox (uniquement pour les occlusions)
        if (selectedBboxLabel === "Occlusion") {
            if (!isDrawingBbox) {
                setIsDrawingBbox(true);
                setBboxStart({ x, y, width: 0, height: 0 });
            } else {
                const newBboxes = { ...bboxes };
                if (!newBboxes[currentPage]) newBboxes[currentPage] = [];

                const startX = Math.min(bboxStart.x, x);
                const startY = Math.min(bboxStart.y, y);
                const endX = Math.max(bboxStart.x, x);
                const endY = Math.max(bboxStart.y, y);

                newBboxes[currentPage].push({
                    x1: startX,
                    y1: startY,
                    x2: endX,
                    y2: endY,
                    label: "Occlusion"
                });

                setBboxes(newBboxes);
                setIsDrawingBbox(false);
                setBboxStart(null);
                drawAll();
            }
        }
    };

    const handleMouseMove = (event) => {
        if (!isDrawingBbox || !bboxStart) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        setBboxStart({
            ...bboxStart,
            width: x - bboxStart.x,
            height: y - bboxStart.y
        });

        drawAll();
    };

    const undoLastKeypoint = () => {
        const newKeypoints = { ...keypoints };
        const list = newKeypoints[currentPage];
        if (!list || list.length === 0) return;

        const removed = list.pop();

        const newSkeletons = { ...skeletons };
        if (newSkeletons[currentPage]) {
            newSkeletons[currentPage] = newSkeletons[currentPage].filter(s =>
                !(s.x1 === removed.x && s.y1 === removed.y && s.label1 === removed.label) &&
                !(s.x2 === removed.x && s.y2 === removed.y && s.label2 === removed.label)
            );
        }

        setKeypoints(newKeypoints);
        setSkeletons(newSkeletons);
        drawAll();
    };

    const undoLastSkeleton = () => {
        const newSkeletons = { ...skeletons };
        if (!newSkeletons[currentPage] || newSkeletons[currentPage].length === 0) return;

        const lastSkeleton = newSkeletons[currentPage].pop();
        
        // Mise à jour des relations parentales
        const newKeypoints = { ...keypoints };
        const currentKps = newKeypoints[currentPage];
        
        if (currentKps) {
            const indexSecond = currentKps.findIndex(kp =>
                kp.x === lastSkeleton.x2 && kp.y === lastSkeleton.y2 && kp.label === lastSkeleton.label2
            );
            
            if (indexSecond !== -1) {
                if (Array.isArray(currentKps[indexSecond].parent)) {
                    // Si c'est un tableau de parents, on retire le parent correspondant
                    currentKps[indexSecond].parent = currentKps[indexSecond].parent.filter(p =>
                        !(p.x === lastSkeleton.x1 && p.y === lastSkeleton.y1 && p.label === lastSkeleton.label1)
                    );
                    
                    // Si il ne reste qu'un seul parent, on le transforme en objet simple
                    if (currentKps[indexSecond].parent.length === 1) {
                        currentKps[indexSecond].parent = currentKps[indexSecond].parent[0];
                    }
                } else if (currentKps[indexSecond].parent) {
                    // Si c'est un seul parent et que c'est celui qu'on retire
                    const parent = currentKps[indexSecond].parent;
                    if (parent.x === lastSkeleton.x1 && parent.y === lastSkeleton.y1 && parent.label === lastSkeleton.label1) {
                        currentKps[indexSecond].parent = null;
                    }
                }
            }
        }

        setKeypoints(newKeypoints);
        setSkeletons(newSkeletons);
        drawAll();
    };

    const resetKeypoints = () => {
        const newKeypoints = { ...keypoints };
        delete newKeypoints[currentPage];

        const newSkeletons = { ...skeletons };
        if (newSkeletons[currentPage]) {
            const points = keypoints[currentPage] || [];
            const coordsSet = new Set(points.map(p => `${p.x}-${p.y}-${p.label}`));
            newSkeletons[currentPage] = newSkeletons[currentPage].filter(s =>
                !coordsSet.has(`${s.x1}-${s.y1}-${s.label1}`) &&
                !coordsSet.has(`${s.x2}-${s.y2}-${s.label2}`)
            );
        }

        setKeypoints(newKeypoints);
        setSkeletons(newSkeletons);
        drawAll();
    };

    const resetSkeletons = () => {
        const newSkeletons = { ...skeletons };
        delete newSkeletons[currentPage];
        setSkeletons(newSkeletons);
        drawAll();
    };

    const undoLastBbox = () => {
        const newBboxes = { ...bboxes };
        if (!newBboxes[currentPage] || newBboxes[currentPage].length === 0) return;

        newBboxes[currentPage].pop();
        setBboxes(newBboxes);
        drawAll();
    };

    const resetBboxes = () => {
        const newBboxes = { ...bboxes };
        delete newBboxes[currentPage];
        setBboxes(newBboxes);
        drawAll();
    };

    useEffect(() => {
        drawAll();
    }, [keypoints, skeletons, bboxes, currentPage, keypointSize, isDrawingBbox, bboxStart]);

    return {
        keypoints,
        skeletons,
        bboxes,
        handleCanvasClick,
        handleMouseMove,
        drawAll,
        resetKeypoints,
        resetSkeletons,
        resetBboxes,
        undoLastKeypoint,
        undoLastSkeleton,
        undoLastBbox,
        setKeypoints,
        setSkeletons,
        setBboxes,
        colors
    };
}