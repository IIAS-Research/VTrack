// Canvas component for displaying medical images and handling user interactions
// Manages click detection, image coordinate conversion, and overlay rendering

// ImageCanvas - Renders the image viewer with canvas overlay for annotations
function ImageCanvas({ viewerRef, canvasRef, handleCanvasClick }) {
    const [imageBounds, setImageBounds] = useState(null);
    
    // Function to check if click is inside image
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

    // Function to convert canvas coordinates to original image coordinates
    const convertCanvasToImageCoords = (clientX, clientY) => {
        const img = viewerRef.current?.querySelector('img');
        const canvas = canvasRef.current;
        
        if (!img || !canvas) return { x: 0, y: 0 };
        
        const canvasRect = canvas.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        // Calculate ratio between displayed size and natural size
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;
        
        // Convert click coordinates to image-relative coordinates
        const x = (clientX - imgRect.left) * scaleX;
        const y = (clientY - imgRect.top) * scaleY;
        
        return { x, y };
    };

    // Intercept click and check if it's inside image
    const handleClick = (event) => {
        if (isClickInsideImage(event.clientX, event.clientY)) {
            const { x, y } = convertCanvasToImageCoords(event.clientX, event.clientY);
            
            // Create new event with transformed coordinates
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