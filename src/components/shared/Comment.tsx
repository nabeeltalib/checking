import React from 'react';

const Comment = ({ comment, setReply, show, setCommentId }: any) => {

  const handleReply = () => {
    setReply(true);
    setCommentId(comment.$id);
  };

  return (
    <div className="mb-2">
      <li key={comment.$id} className="py-2 flex gap-3 items-start">
        <img
          src={comment.user.ImageUrl}
          alt="user"
          className="rounded-full"
          width={20}
          height={20}
        />
        <div>
          <p className="text-gray-400 text-xs">@{comment.user.Username}</p>
          <p className="text-sm">{comment.Content}</p>
        </div>
        {show && (
          <button onClick={handleReply} className="mt-5 text-blue-600">
            Reply
          </button>
        )}
      </li>

      {comment.Reply && comment.Reply.length > 0 && (
        <div className="ml-8 flex flex-col gap-3 mt-2">
          {comment.Reply.map((reply: any, index: number) => (
            <div className="flex items-center gap-3" key={index}>
              <img
                src={reply.userId.ImageUrl}
                alt="user"
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
