import { Button } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListData } from "../data/List";
import { userData } from "../data/user";
import { createList, getReportedComments } from "@/lib/appwrite/api";
import { Loader } from "@/components/shared";
import ReportedComments from "@/components/shared/ReportedComments";
import { Users, List, AlertTriangle, BarChart2 } from "lucide-react";

const AdminPanel = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [reportedComments, setReportedComments] = useState<any>([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        if (!user.isAdmin) {
            navigate("/");
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            let data = await getReportedComments();
            setReportedComments(data);
        };

        fetchData();
    }, [refresh, user]);

    const { mutateAsync: createUserAccount } = useCreateUserAccount();

    const handleBulkUpload = async () => {
        setIsLoading(true);
        for (let item of userData) {
            await createUserAccount(item);
        }
        
        for (let item of ListData) {
            await createList(item, user.id);
        }
        setIsLoading(false);
    };

    const DashboardCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
        <div className="bg-dark-3 p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-light-2">{title}</h3>
                <p className="text-3xl font-bold text-light-1">{value}</p>
            </div>
            <div className="text-primary-500">{icon}</div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-light-1 text-center mb-2">Admin Dashboard</h1>
                <p className="text-light-3 text-center">Welcome back, {user.name}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <DashboardCard title="Total Users" value={1000} icon={<Users size={24} />} />
                <DashboardCard title="Total Lists" value={500} icon={<List size={24} />} />
                <DashboardCard title="Reported Comments" value={reportedComments.length} icon={<AlertTriangle size={24} />} />
                <DashboardCard title="Active Users" value={750} icon={<BarChart2 size={24} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-dark-2 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-light-1 mb-4">Bulk Upload</h2>
                    <p className="text-light-2 mb-4">Create 100 lists and 10 users with a single click:</p>
                    <Button 
                        onClick={handleBulkUpload} 
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader /> : "Start Bulk Upload"}
                    </Button>
                </section>

                <section className="bg-dark-2 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-light-1 mb-4">Review Reported Comments</h2>
                    {reportedComments && reportedComments.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {reportedComments.map((comment: any) => (
                                <ReportedComments comment={comment} setRefresh={setRefresh} key={comment.$id} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-light-2">No reported comments to review.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminPanel;