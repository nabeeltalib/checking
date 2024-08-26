import React from 'react';

interface CommentProps {
  comment: {
    $id: string;
    Content: string;
    user: {
      ImageUrl: string | null;
      Username: string;
    };
    Reply?: Array<{
      userId: {
        ImageUrl: string | null;
        Username: string;
      };
      Content: string;
    }>;
  };
  setReply: (value: boolean) => void;
  show: boolean;
  setCommentId: (id: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, setReply, show, setCommentId }) => {
  const handleReply = () => {
    setReply(true);
    setCommentId(comment.$id);
  };

  return (
    <div className="mb-2">
      <li className="py-2 flex gap-3 items-start">
        <img
          src={comment.user.ImageUrl || '/assets/icons/profile-placeholder.svg'}
          alt={comment.user.Username}
          className="rounded-full"
          width={20}
          height={20}
        />
        <div>
          <p className="text-gray-400 text-xs">@{comment.user.Username}</p>
          <p className="text-sm">{comment.Content}</p>
        </div>
        {show && (
          <button onClick={handleReply} className="mt-5 text-blue-600" aria-label={`Reply to ${comment.user.Username}`}>
            Reply
          </button>
        )}
      </li>

      {comment.Reply && comment.Reply.length > 0 && (
        <div className="ml-8 flex flex-col gap-3 mt-2">
          {comment.Reply.map((reply, index) => (
            <div className="flex items-center gap-3" key={index}>
              <img
                src={reply.userId.ImageUrl || '/assets/icons/profile-placeholder.svg'}
                alt={reply.userId.Username}
                className="rounded-full"
                width={20}
                height={20}
              />
              <div>
                <p className="text-gray-400 text-xs">@{reply.userId.Username}</p>
                <p className="text-sm">{reply.Content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
