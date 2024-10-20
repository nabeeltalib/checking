import React, { useEffect, useState } from 'react';
import { getListComments, addListComment } from '@/lib/appwrite/api';
import { IComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/shared';
import Comment from '@/components/shared/Comment';

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
      } catch (err) {
        console.error('Error fetching comments:', err);
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
      user: { id: 'temp', name: 'You' },
    };

    setComments((prevComments) => [...prevComments, optimisticComment]);
    setNewComment('');

    setIsSubmitting(true);
    try {
      const comment = await addListComment(listId, newComment);
      setComments((prevComments) =>
        prevComments.map((c) => (c.id === optimisticComment.id ? comment : c))
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== optimisticComment.id)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
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
                <Comment
                  key={comment.id}
                  comment={comment}
                  setReply={() => {}}
                  show={true}
                  setCommentId={() => {}}
                  setParentReplyId={() => {}}
                  listId={listId}
                  onCommentDeleted={handleCommentDeleted}
                />
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
          maxLength={500}
        />
        <Button
          onClick={handleAddComment}
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  );
};

export default ListComments;