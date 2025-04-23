import { useState, useEffect, useRef } from "react";

export function useAnnotations({ canvasRef, currentPage, keypointSize, selectedKeypointLabel, selectedSkeletonLabel, selectedBboxLabel }) {
    // State structure: { pageNum: { points: [], history: [] } } etc.
    const keypointIdRef = useRef(0);

    const [keypoints, setKeypoints] = useState({});
    const [skeletons, setSkeletons] = useState({});
    const [bboxes, setBboxes] = useState({});

    const [startPoint, setStartPoint] = useState(null);
    const [isDrawingBbox, setIsDrawingBbox] = useState(false);
    const [bboxStart, setBboxStart] = useState(null);
    const lastClickTimestampRef = useRef(0); // Ref to store the last click time

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
        "Occlusion": "#FF0000",                     // rouge pour les occlusions
        "Hide Region": "#000000"
    };

    // Helper to initialize page data if it doesn't exist
    const ensurePageData = (page) => {
        setKeypoints(prev => ({
            ...prev,
            [page]: prev[page] || { points: [], history: [] }
        }));
        setSkeletons(prev => ({
            ...prev,
            [page]: prev[page] || { segments: [], history: [] }
        }));
        setBboxes(prev => ({
            ...prev,
            [page]: prev[page] || { boxes: [], history: [] }
        }));
    };

    // Initialize data for the current page when it changes
    useEffect(() => {
        ensurePageData(currentPage);
    }, [currentPage]);

    // Effect to redraw canvas whenever annotations or relevant view state changes
    useEffect(() => {
        // Need to ensure data structure exists, especially on initial load or page change
        // ensurePageData(currentPage); // <--- REMOVED: This call caused the infinite loop
        // Call drawAll whenever relevant state updates
        drawAll(currentPage);
        // Dependencies: include all states that should trigger a redraw
    }, [keypoints, skeletons, bboxes, currentPage, keypointSize, isDrawingBbox, bboxStart, canvasRef.current]); // Added canvasRef.current dependency

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
        // Clear canvas is now handled by drawAll
        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        const points = keypoints[page]?.points || []; // Access points array
        points.forEach(({ x, y, label, parents }) => {
            ctx.fillStyle = colors[label];
            ctx.beginPath();
            ctx.arc(x, y, keypointSize, 0, 2 * Math.PI);
            ctx.fill();

            if (parents && parents.length > 0) {
                parents.forEach(parentId => {
                        const parent = points.find(p => p.id === parentId);
                        if (parent.label === label) {
                            ctx.strokeStyle = colors[label];
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(parent.x, parent.y);
                            ctx.lineTo(x, y);
                            ctx.stroke();
                        }
                });
            }            
        });
    };

    const drawSkeletons = (page = currentPage) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const segments = skeletons[page]?.segments || []; // Access segments array
        segments.forEach(({ x1, y1, label1, x2, y2, label2 }) => {
            ctx.strokeStyle = colors[label1];
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

        const boxes = bboxes[page]?.boxes || []; // Access boxes array
        boxes.forEach(({ x1, y1, x2, y2, label }) => {
            if (label === "Hide Region") {
                // Dessin spécial : remplissage noir
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 0.4; // ou 1.0 si tu veux du noir opaque
                ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
                ctx.globalAlpha = 1.0;
            } else {
                // Dessin normal
                ctx.strokeStyle = colors[label];
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
                ctx.fillStyle = colors[label];
                ctx.font = "12px Arial";
                ctx.fillText(label, x1, y1 - 5);
            }
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

    // Function to clear redo history for a specific type
    const clearHistory = (type, page = currentPage) => {
        if (type === 'keypoint') {
            setKeypoints(prev => ({
                ...prev,
                [page]: { ...prev[page], history: [] }
            }));
        } else if (type === 'skeleton') {
            setSkeletons(prev => ({
                ...prev,
                [page]: { ...prev[page], history: [] }
            }));
        } else if (type === 'bbox') {
             setBboxes(prev => ({
                ...prev,
                [page]: { ...prev[page], history: [] }
            }));
        }
    };

    const handleCanvasClick = (event) => {

        // Si aucun mode n'est sélectionné, on ne fait rien
        if (!selectedKeypointLabel && !selectedSkeletonLabel && !selectedBboxLabel) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        ensurePageData(currentPage); // Ensure data exists

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Gestion des keypoints (vaisseaux)
        if (selectedKeypointLabel) {
            console.log(`Adding keypoint for label: ${selectedKeypointLabel}`); // Log which label is active
            clearHistory('keypoint'); // Clear redo history on new action
            clearHistory('skeleton'); // Adding a keypoint might invalidate skeleton redo? (For safety)

            // --- Refinement: Calculate parent and new point *before* the updater --- 
            const currentPoints = keypoints[currentPage]?.points || [];
            const lastPointOfLabel = currentPoints.filter(k => k.label === selectedKeypointLabel).slice(-1)[0];
            
            const newPoint = {
                id: keypointIdRef.current++,  // auto-incrément
                x,
                y,
                label: selectedKeypointLabel,
                parents: lastPointOfLabel ? [lastPointOfLabel.id] : []
              };
            // --- End Refinement ---

            setKeypoints(prev => {
                const now = event.timeStamp;
                const timeSinceLastClick = now - lastClickTimestampRef.current;

                // Debounce: If click is too soon (less than 10ms), ignore it
                if (timeSinceLastClick < 10) {
                    console.log(`Click ignored (debounce ${timeSinceLastClick}ms)`);
                    return prev;
                }

                // Update last click time *before* proceeding
                lastClickTimestampRef.current = now;

                const newKeypoints = { ...prev };
                // Ensure the page data structure exists within the state object
                const pageData = newKeypoints[currentPage] || { points: [], history: [] }; 
                // Add the pre-calculated new point
                pageData.points = [...pageData.points, newPoint]; 
                newKeypoints[currentPage] = pageData;
                return newKeypoints;
            });
            // drawAll(); // Removed - useEffect handles this
            return;
        }

        // Gestion des squelettes
        if (selectedSkeletonLabel) {
            const kp = keypoints[currentPage]?.points || [];

            const closest = kp.reduce((closest, candidate) => {
                const dist = Math.hypot(candidate.x - x, candidate.y - y);
                if (dist < closest.dist) return { kp: candidate, dist };
                return closest;
            }, { kp: null, dist: Infinity }).kp;

            if (!closest) return;

            if (!startPoint) {
                setStartPoint(closest);
                // No drawAll needed here, just setting start point
            } else {
                // Ne pas connecter un point à lui-même
                if (
                    startPoint.x === closest.x &&
                    startPoint.y === closest.y &&
                    startPoint.label === closest.label
                ) {
                    console.warn("Squelette ignoré : un point ne peut pas se connecter à lui-même.");
                    setStartPoint(null);
                    return;
                }
                clearHistory('skeleton'); // Clear redo history on new action
                setSkeletons(prev => {
                    const now = event.timeStamp;
                    const timeSinceLastClick = now - lastClickTimestampRef.current;
            
                    // Debounce: If click is too soon (less than 10ms), ignore it
                    if (timeSinceLastClick < 10) {
                        console.log(`Click ignored (debounce ${timeSinceLastClick}ms)`);
                        return prev;
                    }
            
                    // Update last click time *before* proceeding
                    lastClickTimestampRef.current = now;

                    const newSkeletons = { ...prev };
                    const pageData = newSkeletons[currentPage];
                    pageData.segments = [...pageData.segments, {
                        x1: startPoint.x, y1: startPoint.y, label1: startPoint.label,
                        x2: closest.x, y2: closest.y, label2: closest.label
                    }];
                    return newSkeletons;
                });
                // ✅ Mettre à jour le parent du point destination
                setKeypoints(prev => {
                    const newKeypoints = { ...prev };
                    const pageData = newKeypoints[currentPage];
                    if (!pageData) return prev;
                
                    const updatedPoints = pageData.points.map(p => {
                        if (
                            p.x === closest.x &&
                            p.y === closest.y &&
                            p.label === closest.label
                        ) {
                            return {
                                ...p,
                                parents: [...(p.parents || []), startPoint.id]
                            };
                        }
                        return p;
                    });
                
                    newKeypoints[currentPage] = { ...pageData, points: updatedPoints };
                    return newKeypoints;
                });

                setStartPoint(null);
                // drawAll(); // Removed - useEffect handles this
            }
            return;
        }

        // Gestion des Bbox 
        const bboxLabels = ["Occlusion", "Hide Region"];
        if (bboxLabels.includes(selectedBboxLabel)) {
            console.log("Handling Bbox click"); // Log bbox handling
            if (!isDrawingBbox) {
                setIsDrawingBbox(true);
                setBboxStart({ x, y, width: 0, height: 0 });
                // No drawAll needed here, starting bbox draw
            } else {
                clearHistory('bbox'); // Clear redo history on new action
                setBboxes(prev => {
                    const now = event.timeStamp;
                    const timeSinceLastClick = now - lastClickTimestampRef.current;
            
                    // Debounce: If click is too soon (less than 10ms), ignore it
                    if (timeSinceLastClick < 10) {
                        console.log(`Click ignored (debounce ${timeSinceLastClick}ms)`);
                        return prev;
                    }
            
                    // Update last click time *before* proceeding
                    lastClickTimestampRef.current = now;

                    const newBboxes = { ...prev };
                    const pageData = newBboxes[currentPage];

                    const startX = Math.min(bboxStart.x, x);
                    const startY = Math.min(bboxStart.y, y);
                    const endX = Math.max(bboxStart.x, x);
                    const endY = Math.max(bboxStart.y, y);

                    pageData.boxes = [...pageData.boxes, {
                        x1: startX,
                        y1: startY,
                        x2: endX,
                        y2: endY,
                        label: selectedBboxLabel
                    }];
                    return newBboxes;
                });

                setIsDrawingBbox(false);
                setBboxStart(null);
                // drawAll(); // Removed - useEffect handles this
            }
        }
    };

    const handleMouseMove = (event) => {
        if (!isDrawingBbox || !bboxStart || !["Occlusion", "Hide Region"].includes(selectedBboxLabel)) return; // Ensure bbox mode

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Update the temporary drawing dimensions, but don't save yet
        // This state update *will* trigger the useEffect and drawAll
        setBboxStart(prev => ({
            ...prev,
            currentX: x, // Store current mouse position for drawing
            currentY: y
        }));

        // Redraw to show the rectangle being dragged
        // drawAll(); // Removed - useEffect handles this

        // Draw the temporary rectangle being created
        // This part needs to stay to show the rubber band effect *during* the drag
        // but it should happen *after* the main drawAll call from useEffect updates the canvas
        // So, let's move this drawing logic into the useEffect as well, conditionally
        // UPDATE: It's actually better to keep this immediate draw for responsiveness.
        // The useEffect will clear and redraw everything, and then this temporary
        // rect will be drawn over it immediately on mouse move.
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = colors[selectedBboxLabel];
        ctx.lineWidth = 2;
        // Use currentX/currentY from state if available, otherwise use event's x/y
        const currentX = bboxStart?.currentX ?? x;
        const currentY = bboxStart?.currentY ?? y;
        ctx.strokeRect(bboxStart.x, bboxStart.y, currentX - bboxStart.x, currentY - bboxStart.y);
    };

    const removeKeypointAndRelations = (pointId, page) => {
        const pointData = keypoints[page];
        const skeletonData = skeletons[page];
        if (!pointData || !skeletonData) return;
    
        const removedPoint = pointData.points.find(p => p.id === pointId);
        if (!removedPoint) return;
    
        // Nettoyage des parents dans tous les points
        const cleanedPoints = pointData.points
            .filter(p => p.id !== pointId)  // Supprimer le point lui-même
            .map(p => ({
                ...p,
                parents: (p.parents || []).filter(pid => pid !== pointId)
            }));
    
        // Supprimer tous les segments où ce point apparaît
        const removedSegments = [];
        const remainingSegments = [];
    
        for (const seg of skeletonData.segments) {
            if (
                seg.x1 === removedPoint.x && seg.y1 === removedPoint.y && seg.label1 === removedPoint.label ||
                seg.x2 === removedPoint.x && seg.y2 === removedPoint.y && seg.label2 === removedPoint.label
            ) {
                removedSegments.push(seg);
            } else {
                remainingSegments.push(seg);
            }
        }
    
        // Mettre à jour les states
        setKeypoints(prev => ({
            ...prev,
            [page]: {
                points: cleanedPoints,
                history: [...(prev[page]?.history || []), { ...removedPoint, undoneSkeletons: removedSegments }]
            }
        }));
    
        setSkeletons(prev => ({
            ...prev,
            [page]: {
                segments: remainingSegments,
                history: prev[page]?.history || []
            }
        }));
    };

    const undoLastKeypoint = () => {
        ensurePageData(currentPage);
    
        const pageData = keypoints[currentPage];
        if (!pageData || pageData.points.length === 0) return;
    
        const lastPoint = pageData.points[pageData.points.length - 1];
        if (!lastPoint) return;
    
        removeKeypointAndRelations(lastPoint.id, currentPage);
    };

    const restoreKeypointAndRelations = (point, segmentsToRestore, page) => {
        // Restaurer le point
        setKeypoints(prev => {
            const pageData = prev[page] || { points: [], history: [] };

            const alreadyExists = pageData.points.some(p => p.id === point.id);
            if (alreadyExists) return prev;

            return {
                ...prev,
                [page]: {
                    points: [...pageData.points, point],
                    history: pageData.history
                }
            };
        });
    
        // Restaurer les skeletons associés
        if (segmentsToRestore && segmentsToRestore.length > 0) {
            setSkeletons(prev => {
                const pageData = prev[page] || { segments: [], history: [] };
                const currentSegments = pageData.segments;
                const segmentSet = new Set(currentSegments.map(s => JSON.stringify(s)));
    
                const newSegments = [...currentSegments];
                for (const seg of segmentsToRestore) {
                    const key = JSON.stringify(seg);
                    if (!segmentSet.has(key)) {
                        newSegments.push(seg);
                        segmentSet.add(key);
                    }
                }
    
                return {
                    ...prev,
                    [page]: {
                        segments: newSegments,
                        history: []  // On clear l'historique ici aussi
                    }
                };
            });
        }
    };

    const redoLastKeypoint = () => {
        ensurePageData(currentPage);
        setKeypoints(prev => {
            const pageData = prev[currentPage];
            if (!pageData || pageData.history.length === 0) return prev;
    
            const newPoints = [...pageData.points];
            const history = [...pageData.history];
            const restoredEntry = history.pop();
    
            const { undoneSkeletons, ...restoredPoint } = restoredEntry;
    
            // Restaurer le point et ses relations
            restoreKeypointAndRelations(restoredPoint, undoneSkeletons, currentPage);
    
            // Retourner un nouvel état de keypoints sans le point dans l'historique
            return {
                ...prev,
                [currentPage]: {
                    points: newPoints,
                    history
                }
            };
        });
    };

    const undoLastSkeleton = () => {
        ensurePageData(currentPage);
        setSkeletons(prev => {
            const newSkeletons = { ...prev };
            const pageData = newSkeletons[currentPage];
            if (!pageData || pageData.segments.length === 0) return prev; // No segments to undo

            const segments = [...pageData.segments];
            const history = [...pageData.history];
            const removedSegment = segments.pop(); // Le segment à annuler
            history.push(removedSegment);

            // Mise à jour des parents des points associés à ce segment
            setKeypoints(prevKeypoints => {
                const updatedKeypoints = { ...prevKeypoints };
                const pageKeypoints = updatedKeypoints[currentPage];
                if (!pageKeypoints) return prevKeypoints;
            
                // Trouver le point parent dans le segment supprimé (à partir des coordonnées)
                const sourcePoint = pageKeypoints.points.find(p =>
                    p.x === removedSegment.x1 &&
                    p.y === removedSegment.y1 &&
                    p.label === removedSegment.label1
                );
                
                // Supprimer ce parent des points concernés
                if (sourcePoint) {
                    pageKeypoints.points = pageKeypoints.points.map(point => {
                        if (point.parents) {
                            point.parents = point.parents.filter(parentId => parentId !== sourcePoint.id);
                        }
                        return point;
                    });
                }
            
                updatedKeypoints[currentPage] = pageKeypoints;
                return updatedKeypoints;
            });
            newSkeletons[currentPage] = { segments, history };
            return newSkeletons;
        });
    };

    const redoLastSkeleton = () => {
        ensurePageData(currentPage);
         setSkeletons(prev => {
            const newSkeletons = { ...prev };
            const pageData = newSkeletons[currentPage];
            if (!pageData || pageData.history.length === 0) return prev; // No history to redo

            const segments = [...pageData.segments];
            const history = [...pageData.history];
            const restoredSegment = history.pop();
            segments.push(restoredSegment);

            newSkeletons[currentPage] = { segments, history };
            return newSkeletons;
        });
    };

    const undoLastBbox = () => {
        ensurePageData(currentPage);
        setBboxes(prev => {
            const newBboxes = { ...prev };
            const pageData = newBboxes[currentPage];
            if (!pageData || pageData.boxes.length === 0) return prev; // No boxes to undo

            const boxes = [...pageData.boxes];
            const history = [...pageData.history];
            const removedBox = boxes.pop();
            history.push(removedBox);

            newBboxes[currentPage] = { boxes, history };
            return newBboxes;
        });
    };

     const redoLastBbox = () => {
        ensurePageData(currentPage);
         setBboxes(prev => {
            const newBboxes = { ...prev };
            const pageData = newBboxes[currentPage];
            if (!pageData || pageData.history.length === 0) return prev; // No history to redo

            const boxes = [...pageData.boxes];
            const history = [...pageData.history];
            const restoredBox = history.pop();
            boxes.push(restoredBox);

            newBboxes[currentPage] = { boxes, history };
            return newBboxes;
        });
    };

    const resetKeypoints = () => {
        ensurePageData(currentPage);
        setKeypoints(prev => ({
            ...prev,
            [currentPage]: { points: [], history: [] } // Clear points and history
        }));
         // Also reset related skeletons? Yes, seems logical.
        resetSkeletons();
    };

    const resetSkeletons = () => {
        ensurePageData(currentPage);
    
        // On nettoie aussi les parents dans les keypoints associés aux segments
        setKeypoints(prevKeypoints => {
            const updatedKeypoints = { ...prevKeypoints };
            const pageKeypoints = updatedKeypoints[currentPage];
            const pageSkeletons = skeletons[currentPage];
    
            if (!pageKeypoints || !pageSkeletons) return prevKeypoints;
    
            const segments = pageSkeletons.segments;
    
            // Pour chaque segment, on identifie le point parent
            const parentPoints = segments.map(seg => {
                return pageKeypoints.points.find(p =>
                    p.x === seg.x1 &&
                    p.y === seg.y1 &&
                    p.label === seg.label1
                );
            }).filter(p => p !== undefined); // enlever les nulls au cas où
    
            const parentIds = parentPoints.map(p => p.id);
    
            // Nettoyer tous les parents dans les points
            pageKeypoints.points = pageKeypoints.points.map(point => {
                if (point.parents) {
                    point.parents = point.parents.filter(pid => !parentIds.includes(pid));
                }
                return point;
            });
    
            updatedKeypoints[currentPage] = pageKeypoints;
            return updatedKeypoints;
        });
    
        // On efface les segments
        setSkeletons(prev => ({
            ...prev,
            [currentPage]: { segments: [], history: [] } // Clear segments and history
        }));
    
        setStartPoint(null); // Reset point de départ éventuel
    };

     const resetBboxes = () => {
        ensurePageData(currentPage);
         setBboxes(prev => ({
            ...prev,
            [currentPage]: { boxes: [], history: [] } // Clear boxes and history
        }));
        setIsDrawingBbox(false); // Reset bbox drawing state
        setBboxStart(null);
    };

    // Helpers to check if redo is possible
    const canRedoKeypoint = keypoints[currentPage]?.history?.length > 0;
    const canRedoSkeleton = skeletons[currentPage]?.history?.length > 0;
    const canRedoBbox = bboxes[currentPage]?.history?.length > 0;

    // Export functions and state
    return {
        keypoints: keypoints[currentPage]?.points || [], // Expose only points
        skeletons: skeletons[currentPage]?.segments || [], // Expose only segments
        bboxes: bboxes[currentPage]?.boxes || [], // Expose only boxes
        setKeypoints: (data) => setKeypoints(prev => ({ ...prev, [currentPage]: { points: data, history: [] } })), // Update requires resetting history
        setSkeletons: (data) => setSkeletons(prev => ({ ...prev, [currentPage]: { segments: data, history: [] } })),
        setBboxes: (data) => setBboxes(prev => ({ ...prev, [currentPage]: { boxes: data, history: [] } })),
        handleCanvasClick,
        handleMouseMove,
        drawAll,
        resetKeypoints,
        resetSkeletons,
        resetBboxes,
        undoLastKeypoint,
        undoLastSkeleton,
        undoLastBbox,
        redoLastKeypoint,   // Export redo function
        redoLastSkeleton,   // Export redo function
        redoLastBbox,       // Export redo function
        canRedoKeypoint,    // Export checker function
        canRedoSkeleton,    // Export checker function
        canRedoBbox,        // Export checker function
        colors
    };
}