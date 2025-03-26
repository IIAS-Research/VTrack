import React from 'react';
import Menu from '../component/components/menu';
import Annotator from '../component/annotator';

const Dashboard = () => {
    return (
        <div>
            <Menu />
            <div style={{ display: 'flex' }}>
                <div style={{ width: '100%' }}>
                    <Annotator />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;