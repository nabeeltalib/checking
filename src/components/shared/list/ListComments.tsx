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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const listComments = await getListComments(listId);
        setComments(listComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [listId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const comment = await addListComment(listId, newComment);
      setComments((prevComments) => [...prevComments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
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
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="comment-item p-3 mb-3 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-sm"
              >
                <p className="text-gray-900 dark:text-white">{comment.content}</p>
                <small className="text-gray-500 dark:text-gray-400">
                  {comment.user.name}
                </small>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
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
        />
        <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  );
};

export default ListComments;
