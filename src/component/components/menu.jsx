import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Menu = () => {
    const location = useLocation();
    const isInstructionsPage = location.pathname === '/instructions';

    return (
        <div className="fixed w-full flex justify-between items-center py-3 px-6 z-10 bg-white shadow-lg border-b border-gray-100">
            <div className="flex items-center">
                <h1 className="text-3xl font-bold text-indigo-700 tracking-wide">
                    V-track
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                {isInstructionsPage ? (
                    <Link 
                        to="/" 
                        className="relative px-5 py-2 font-medium text-indigo-700 group"
                    >
                        <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-indigo-200 group-hover:-translate-x-0 group-hover:-translate-y-0 rounded"></span>
                        <span className="absolute inset-0 w-full h-full bg-white border-2 border-indigo-700 group-hover:bg-indigo-100 rounded"></span>
                        <span className="relative text-lg">Annotator</span>
                    </Link>
                ) : (
                    <Link 
                        to="/instructions" 
                        className="relative px-5 py-2 font-medium text-indigo-700 group"
                    >
                        <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-indigo-200 group-hover:-translate-x-0 group-hover:-translate-y-0 rounded"></span>
                        <span className="absolute inset-0 w-full h-full bg-white border-2 border-indigo-700 group-hover:bg-indigo-100 rounded"></span>
                        <span className="relative text-lg">Instructions</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Menu;