import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Menu = () => {
    const location = useLocation();
    const isInstructionsPage = location.pathname === '/instructions';

    return (
        <div className="fixed w-full flex justify-between items-center py-4 px-5 z-10 bg-white shadow-md">
            <h1 className="text-xl font-bold">Vessels Annotator</h1>
            {isInstructionsPage ? (
                <Link to="/" className="text-lg">Annotator</Link>
            ) : (
                <Link to="/instructions" className="text-lg">Instructions</Link>
            )}
        </div>
    );
};

export default Menu;