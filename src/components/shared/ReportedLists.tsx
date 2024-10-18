import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteList, updateListStatus } from "@/lib/appwrite/api";
import Loader from "./Loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const ReportedLists = ({ list, setRefresh }) => {
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isLoadingIgnore, setIsLoadingIgnore] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleDelete = useCallback(async () => {
        setIsLoadingDelete(true);
        try {
            await deleteList(list.listId);
            await updateListStatus(list.$id, "deleted");
            setIsDialogOpen(false);
            setTimeout(() => {
                setRefresh((prev) => !prev);
                toast({ title: `"${list.listTitle}" Deleted Successfully!` });
            }, 100);
        } catch (error) {
            toast({ title: `Error: ${error}`, variant: "destructive" });
        }
        setIsLoadingDelete(false);
    }, [list, setRefresh, toast]);

    const handleIgnore = useCallback(async () => {
        setIsLoadingIgnore(true);
        try {
            await updateListStatus(list.$id, "reviewed");
            setIsDialogOpen(false);
            setTimeout(() => {
                setRefresh((prev) => !prev);
                toast({ title: `"${list.listTitle}" Ignored Successfully!` });
            }, 100);
        } catch (error) {
            toast({ title: `Error: ${error}`, variant: "destructive" });
        }
        setIsLoadingIgnore(false);
    }, [list, setRefresh, toast]);

    return (
        <div>
            <div className="w-full bg-slate-800 rounded-xl p-4">
                <p className="text-xl font-bold">{list.listTitle}</p>
                <p className="text-base">
                    Reported By: <span className="text-blue-600">@{list.reportedBy}</span>
                </p>
                <p className="text-base">
                    Reason: <span>{list.reason}</span>
                </p>

                <p className="mt-3">
                    <Button onClick={() => setIsDialogOpen(true)} className="mr-3">
                        Take Action
                    </Button>
                </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Take Action on Reported List</DialogTitle>
                        <DialogDescription>
                            Choose an action for the reported list: "{list.listTitle}"
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleDelete} disabled={isLoadingDelete}>
                            {isLoadingDelete ? <Loader /> : "Delete List"}
                        </Button>
                        <Button onClick={handleIgnore} disabled={isLoadingIgnore}>
                            {isLoadingIgnore ? <Loader /> : "Ignore Report"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default React.memo(ReportedLists);