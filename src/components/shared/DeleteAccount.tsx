import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useDeleteUserData } from '@/lib/react-query/queries';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteAccountProps {
  userId: string;
  onSuccess: () => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ userId, onSuccess }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const deleteUserDataMutation = useDeleteUserData();

  const handleDeleteAccount = useCallback(async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      toast({
        title: 'Error',
        description: 'Please type "delete my account" to confirm.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserDataMutation.mutateAsync(userId);

      // Close the dialog
      setIsDialogOpen(false);

      // Delay navigation and toast to allow the dialog to close gracefully
      setTimeout(() => {
        onSuccess(); // Notify the parent component
        navigate('/', { replace: true });
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted.',
        });
      }, 200);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [confirmText, deleteUserDataMutation, navigate, onSuccess, toast, userId]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="bg-dark-2 text-white border-dark-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500 flex items-center gap-2">
            <Trash2 size={24} />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-light-2">
            Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-light-2 mb-4">
            The following data will be permanently deleted:
          </p>
          <ul className="text-light-2 list-disc pl-6 space-y-2">
            <li>Delete all your rankings</li>
            <li>Remove all your comments</li>
            <li>Delete your saved lists</li>
            <li>Remove all friend connections</li>
            <li>Delete your profile permanently</li>
          </ul>

          <div className="mt-6">
            <p className="text-light-2 mb-2">To confirm, type "delete my account":</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-dark-3 border border-dark-4 rounded-lg p-2 text-white"
              placeholder="Type here to confirm"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setIsDialogOpen(false)}
            className="bg-dark-4 text-white hover:bg-dark-3"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white hover:bg-red-600"
            disabled={isDeleting || confirmText.toLowerCase() !== 'delete my account'}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccount;
