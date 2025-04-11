import React from 'react';
import Menu from '../component/components/menu';
import Annotator from '../component/annotator';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            <Menu />
            <div className="container mx-auto px-4 py-6">
                <div className="w-full">
                    <Annotator />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;