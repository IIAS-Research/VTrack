import React from "react";

export function ImageNavigator({ 
    currentPage, 
    imagesLength, 
    dicomLoaded,
    handlePreviousPage, 
    handleNextPage, 
    handleSaveJSON 
}) {
    return (
        <div className="mt-4 w-full flex justify-center">
            <button 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1} 
                className={`px-4 py-2 mr-2 rounded ${currentPage === 1 ? 'bg-sky-100 text-black cursor-no-drop' : 'bg-sky-500 text-white cursor-pointer'}`}
            >
                Previous
            </button>
            <button 
                onClick={handleNextPage} 
                disabled={currentPage >= imagesLength} 
                className={`px-4 py-2 mr-2 rounded ${currentPage >= imagesLength ? 'bg-sky-100 text-black cursor-no-drop' : 'bg-sky-500 text-white cursor-pointer'}`}
            >
                Next
            </button>
            <button 
                onClick={handleSaveJSON} 
                disabled={!dicomLoaded} 
                className={`px-4 py-2 mr-2 rounded ${!dicomLoaded ? 'bg-indigo-100 text-black cursor-no-drop' : 'bg-indigo-500 text-white cursor-pointer'}`}
            >
                Save JSON
            </button>
        </div>
    );
}