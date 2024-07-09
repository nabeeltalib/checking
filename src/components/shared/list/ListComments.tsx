import React, { useEffect, useState } from 'react';
import { getListComments, addListComment } from '@/lib/appwrite/api';
import { IComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ListComments: React.FC<{ listId: string }> = ({ listId }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const listComments = await getListComments(listId);
      setComments(listComments);
    };
    fetchComments();
  }, [listId]);

  const handleAddComment = async () => {
    const comment = await addListComment(listId, newComment);
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="list-comments mt-8">
      <h3 className="h3-bold mb-4">Comments</h3>
      {comments.map(comment => (
        <div key={comment.id} className="comment-item p-2 mb-2 bg-dark-3 rounded">
          <p>{comment.content}</p>
          <small className="text-light-3">{comment.user.name}</small>
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <Input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleAddComment}>Add Comment</Button>
      </div>
    </div>
  );
};

export default ListComments;