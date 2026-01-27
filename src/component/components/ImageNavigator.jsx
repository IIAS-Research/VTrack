// Component for navigating between images and saving annotations
// Provides previous/next buttons, page counter, and export functionality
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

// ImageNavigator - Controls for moving between images and saving work
export function ImageNavigator({ 
    currentPage, 
    imagesLength, 
    imgLoaded, 
    handlePreviousPage, 
    handleNextPage, 
    handleSaveJSON,
    chooseImageButton
}) {
    return (
        <div className="w-full flex justify-center items-center gap-3">
            <button 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1} 
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                    currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-md hover:scale-105'
                }`}
            >
                <ArrowLeft size={16} />
                <span>Previous</span>
            </button>
            
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="font-medium">{currentPage}</span>
                <span className="text-gray-400"> / </span>
                <span className="text-gray-500">{imagesLength || 1}</span>
            </div>
            
            <button 
                onClick={handleNextPage} 
                disabled={currentPage >= imagesLength} 
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                    currentPage >= imagesLength 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-md hover:scale-105'
                }`}
            >
                <span>Next</span>
                <ArrowRight size={16} />
            </button>
            
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveJSON();
                }}
                disabled={!imgLoaded} 
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ml-2 ${
                    !imgLoaded 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md hover:scale-105'
                }`}
            >
                <Save size={16} />
                <span>Save JSON</span>
            </button>
            {chooseImageButton}
        </div>
    );
}