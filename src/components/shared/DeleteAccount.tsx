import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useDeleteUserData } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const DeleteAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteUserDataMutation = useDeleteUserData();

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      toast({
        title: 'Error',
        description: 'Please type "delete my account" to confirm.',
        variant: 'destructive',
      });
      return;
    }

    if (user) {
      try {
        await deleteUserDataMutation.mutateAsync(user.id);
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted.',
        });
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete account. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center"
      >
        <Trash2 size={18} className="mr-2" />
        Delete Account
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">Delete Account</DialogTitle>
            <DialogDescription className="text-light-2">
              This action cannot be undone. All of your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "delete my account" to confirm'
            className="mt-4 bg-dark-4 border-gray-700 text-white"
          />
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setIsDialogOpen(false)}
              className="bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
              disabled={deleteUserDataMutation.isLoading}
            >
              {deleteUserDataMutation.isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteAccount;