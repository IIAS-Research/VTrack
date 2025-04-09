import { useState, useEffect } from "react";

export function useAnnotations({ canvasRef, currentPage, keypointSize, selectedKeypointLabel, selectedSkeletonLabel }) {
    const [keypoints, setKeypoints] = useState({});
    const [skeletons, setSkeletons] = useState({});
    const [startPoint, setStartPoint] = useState(null);

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
        "PCA2 -> PCA3": "#87CEEB"                  // bleu ciel
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

    const drawAll = (page = currentPage) => {
        clearCanvas();
        drawKeypoints(page);
        drawSkeletons(page);
    };

    const handleCanvasClick = (event) => {
        if (!selectedKeypointLabel && !selectedSkeletonLabel) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        if (selectedKeypointLabel) {
            const newKeypoints = { ...keypoints };
            if (!newKeypoints[currentPage]) newKeypoints[currentPage] = [];

            const currentList = newKeypoints[currentPage];
            const last = currentList.filter(k => k.label === selectedKeypointLabel).slice(-1)[0];
            const parent = last || null;

            currentList.push({ x, y, label: selectedKeypointLabel, parent });
            setKeypoints(newKeypoints);
            drawAll();
        }

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

                // Mise à jour du parent
                const newKeypoints = { ...keypoints };
                const currentKps = newKeypoints[currentPage];
                const indexSecond = currentKps.findIndex(kp =>
                    kp.x === closest.x && kp.y === closest.y && kp.label === closest.label
                );
                const indexFirst = currentKps.findIndex(kp =>
                    kp.x === startPoint.x && kp.y === startPoint.y && kp.label === startPoint.label
                );

                if (indexSecond !== -1 && indexFirst !== -1 && !currentKps[indexSecond].parent) {
                    currentKps[indexSecond].parent = currentKps[indexFirst];
                    setKeypoints(newKeypoints);
                }

                setSkeletons(newSkeletons);
                setStartPoint(null);
                drawAll();
            }
        }
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

        newSkeletons[currentPage].pop();
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

    useEffect(() => {
        drawAll();
    }, [keypoints, skeletons, currentPage, keypointSize]);

    return {
        keypoints,
        skeletons,
        handleCanvasClick,
        drawAll,
        resetKeypoints,
        resetSkeletons,
        undoLastKeypoint,
        undoLastSkeleton,
        setKeypoints,
        setSkeletons,
        colors
    };
}