import React, { useEffect, useState } from 'react';
import { getListComments, addListComment } from '@/lib/appwrite/api';
import { IComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/shared';

const ListComments: React.FC<{ listId: string }> = ({ listId }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const listComments = await getListComments(listId);
        setComments(listComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [listId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const optimisticComment: IComment = {
      id: Date.now().toString(),
      content: newComment,
      user: { id: 'temp', name: 'You' }, // Assume "You" as the current user for optimistic update
    };

    setComments((prevComments) => [...prevComments, optimisticComment]);
    setNewComment('');

    setIsSubmitting(true);
    try {
      const comment = await addListComment(listId, newComment);
      setComments((prevComments) =>
        prevComments.map((c) => (c.id === optimisticComment.id ? comment : c))
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== optimisticComment.id)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="list-comments mt-8">
      <h3 className="text-2xl font-bold mb-4">Comments</h3>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {error && <p className="text-red-500">{error}</p>}
          {comments.length > 0 ? (
            <div aria-live="polite">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="comment-item p-3 mb-3 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-sm"
                >
                  <p className="text-gray-900 dark:text-white">{comment.content}</p>
                  <small className="text-gray-500 dark:text-gray-400">
                    {comment.user.name}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">What do you think? Comment below!</p>
          )}
        </>
      )}
      <div className="flex gap-2 mt-4">
        <Input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow"
          disabled={isSubmitting}
          maxLength={500} // Optional: Set a max length for comments
        />
        <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  );
};

export default ListComments;
