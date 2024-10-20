import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Users, List as ListIcon, AlertTriangle, BarChart2, Upload, RefreshCw, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { 
  useCreateUserAccount, 
  useGetTotalUsers, 
  useGetTotalLists, 
  useGetReportedCommentsCount, 
  useGetReportedListsCount,
  useGetActiveUsersCount 
} from "@/lib/react-query/queries";
import { createList, getReportedComments, getReportedLists } from "@/lib/appwrite/api";
import { Loader } from "@/components/shared";
import ReportedComments from "@/components/shared/ReportedComments";
import ReportedLists from "@/components/shared/ReportedLists";
import { ListData } from "../data/List";
import { userData } from "../data/user";

const AdminPanel = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [reportedComments, setReportedComments] = useState<any>([]);
    const [reportedLists, setReportedLists] = useState<any>([]);
    const [refresh, setRefresh] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const { mutateAsync: createUserAccount } = useCreateUserAccount();

    // Use the React Query hooks
    const { data: totalUsers, isLoading: isLoadingUsers } = useGetTotalUsers();
    const { data: totalLists, isLoading: isLoadingLists } = useGetTotalLists();
    const { data: reportedCommentsCount, isLoading: isLoadingReportedComments } = useGetReportedCommentsCount();
    const { data: reportedListsCount, isLoading: isLoadingReportedLists } = useGetReportedListsCount();
    const { data: activeUsers, isLoading: isLoadingActiveUsers, error: activeUsersError } = useGetActiveUsersCount();
    useEffect(() => {
        if (!user.isAdmin) {
            navigate("/");
            toast({
                title: "Access Denied",
                description: "You don't have permission to view this page.",
                variant: "destructive",
            });
        }
    }, [user, navigate, toast]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [commentsData, listsData] = await Promise.all([
                    getReportedComments(),
                    getReportedLists()
                ]);
                setReportedComments(commentsData);
                setReportedLists(listsData);
            } catch (error) {
                console.error("Failed to fetch reported data:", error);
                setError(error.message || "Failed to fetch reported data. Please try again.");
                toast({
                    title: "Error",
                    description: error.message || "Failed to fetch reported data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refresh, toast]);

    const handleBulkUpload = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                ...userData.map(item => createUserAccount(item)),
                ...ListData.map(item => createList(item, user.id))
            ]);
            toast({
                title: "Bulk Upload Successful",
                description: "Users and lists have been created successfully.",
                variant: "default",
            });
        } catch (error) {
            console.error("Bulk upload failed:", error);
            toast({
                title: "Bulk Upload Failed",
                description: "An error occurred during the bulk upload. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const DashboardCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`bg-dark-2 p-6 rounded-lg shadow-md flex items-center justify-between ${color}`}
        >
            <div>
                <h3 className="text-lg font-semibold text-light-2">{title}</h3>
                <p className="text-3xl font-bold text-light-1">{value}</p>
            </div>
            <div className="text-light-1 opacity-80">{icon}</div>
        </motion.div>
    );

    const SidebarItem = ({ icon, label, active, onClick }) => (
        <li 
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            onClick={onClick}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </li>
    );

    return (
        <div className="flex h-screen bg-dark-1">
            {/* Sidebar */}
            <motion.nav 
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                className="w-64 bg-dark-2 p-4"
            >
                <div className="flex items-center mb-8">
                    <h1 className="text-xl font-bold text-light-1">Admin Panel</h1>
                </div>
                <ul className="space-y-2">
                    <SidebarItem icon={<Home size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<AlertTriangle size={20} />} label="Reported Items" active={activeTab === 'reported'} onClick={() => setActiveTab('reported')} />
                    <SidebarItem icon={<Upload size={20} />} label="Bulk Upload" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
                    <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </ul>
            </motion.nav>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-light-1">Welcome back, {user.name}</h1>
                    <p className="text-light-3">Here's what's happening with Topfived today.</p>
                </motion.header>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

            {activeTab === 'dashboard' && (
                <>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
                    >
                        <DashboardCard title="Total Users" value={totalUsers || 0} icon={<Users size={24} />} color="bg-blue-700" />
                        <DashboardCard title="Total Lists" value={totalLists || 0} icon={<ListIcon size={24} />} color="bg-green-800" />
                        <DashboardCard title="Reported Comments" value={reportedCommentsCount || 0} icon={<AlertTriangle size={24} />} color="bg-yellow-700" />
                        <DashboardCard title="Reported Lists" value={reportedListsCount || 0} icon={<AlertTriangle size={24} />} color="bg-yellow-700" />
                        <DashboardCard title="Active Users" value={activeUsers || 0} icon={<BarChart2 size={24} />} color="bg-purple-600" />
                    </motion.div>
                        {activeUsersError && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                                <p className="font-bold">Warning</p>
                                <p>Unable to fetch active users count. Using total users as a fallback.</p>
                            </div>
                        )}
                        {/* Add more dashboard content here */}
                    </>
                )}

                {activeTab === 'reported' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.section 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-dark-2 p-6 rounded-lg shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-light-1">Reported Comments</h2>
                                <Button
                                    onClick={() => setRefresh(!refresh)}
                                    variant="default"
                                    size="sm"
                                    className="text-primary-500"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    Refresh
                                </Button>
                            </div>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader />
                                </div>
                            ) : reportedComments && reportedComments.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {reportedComments.map((comment: any) => (
                                        <ReportedComments comment={comment} setRefresh={setRefresh} key={comment.$id} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-light-2 text-center py-12">No reported comments to review.</p>
                            )}
                        </motion.section>

                        <motion.section 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-dark-2 p-6 rounded-lg shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-light-1">Reported Lists</h2>
                                <Button
                                    onClick={() => setRefresh(!refresh)}
                                    variant="default"
                                    size="sm"
                                    className="text-primary-500"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    Refresh
                                </Button>
                            </div>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader />
                                </div>
                            ) : reportedLists && reportedLists.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {reportedLists.map((list: any) => (
                                        <ReportedLists list={list} setRefresh={setRefresh} key={list.$id} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-light-2 text-center py-12">No reported lists to review.</p>
                            )}
                        </motion.section>
                    </div>
                )}

                {activeTab === 'upload' && (
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-dark-2 p-6 rounded-lg shadow-lg"
                    >
                        <h2 className="text-2xl font-semibold text-light-1 mb-4">Bulk Upload</h2>
                        <p className="text-light-2 mb-4">Create 100 lists and 10 users with a single click:</p>
                        <Button 
                            onClick={handleBulkUpload} 
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader /> : (
                                <>
                                    <Upload className="mr-2" size={20} />
                                    Start Bulk Upload
                                </>
                            )}
                        </Button>
                    </motion.section>
                )}

                {activeTab === 'settings' && (
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-dark-2 p-6 rounded-lg shadow-lg"
                    >
                        <h2 className="text-2xl font-semibold text-light-1 mb-4">Settings</h2>
                        <p className="text-light-2">Admin settings and configuration options can be added here.</p>
                    </motion.section>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;