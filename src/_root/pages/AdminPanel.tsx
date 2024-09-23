import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Users, List as ListIcon, AlertTriangle, BarChart2, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { createList, getReportedComments } from "@/lib/appwrite/api";
import { Loader } from "@/components/shared";
import ReportedComments from "@/components/shared/ReportedComments";
import { ListData } from "../data/List";
import { userData } from "../data/user";

const AdminPanel = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [reportedComments, setReportedComments] = useState<any>([]);
    const [refresh, setRefresh] = useState(false);

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
            try {
                let data = await getReportedComments();
                setReportedComments(data);
            } catch (error) {
                console.error("Failed to fetch reported comments:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch reported comments. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refresh, toast]);

    const { mutateAsync: createUserAccount } = useCreateUserAccount();

    const handleBulkUpload = async () => {
        setIsLoading(true);
        try {
            for (let item of userData) {
                await createUserAccount(item);
            }
            
            for (let item of ListData) {
                await createList(item, user.id);
            }
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

    const DashboardCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-dark-3 p-6 rounded-lg shadow-md flex items-center justify-between"
        >
            <div>
                <h3 className="text-lg font-semibold text-light-2">{title}</h3>
                <p className="text-3xl font-bold text-light-1">{value}</p>
            </div>
            <div className="text-primary-500">{icon}</div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-bold text-light-1 text-center mb-2">Admin Dashboard</h1>
                <p className="text-light-3 text-center">Welcome back, {user.name}</p>
            </motion.header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
                <DashboardCard title="Total Users" value={1000} icon={<Users size={24} />} />
                <DashboardCard title="Total Lists" value={500} icon={<ListIcon size={24} />} />
                <DashboardCard title="Reported Comments" value={reportedComments.length} icon={<AlertTriangle size={24} />} />
                <DashboardCard title="Active Users" value={750} icon={<BarChart2 size={24} />} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
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

                <motion.section 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-dark-2 p-6 rounded-lg shadow-lg"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-light-1">Review Reported Comments</h2>
                        <Button
                            onClick={() => setRefresh(!refresh)}
                            variant="outline"
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
            </div>
        </div>
    );
};

export default AdminPanel;