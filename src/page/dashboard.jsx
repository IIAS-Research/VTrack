// Main dashboard page
// Contains the annotation tool and navigation menu
import Menu from '../component/components/menu';
import Annotator from '../component/annotator';

// Dashboard - Main page with the DICOM annotation interface
const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            <Menu />
            <div className="pt-18 w-full py-6">
                <div className="w-full">
                    <Annotator />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;