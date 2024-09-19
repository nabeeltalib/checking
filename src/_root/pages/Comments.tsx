import { useUserContext } from '@/context/AuthContext';
import { useState } from 'react';
import { useToast } from '@/components/ui/';
import Loader from '@/components/shared/Loader';
import { likeComment, reportComment } from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';

const Comment = ({ comment, setReply, show, setCommentId }: any) => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false)

  const { user } = useUserContext();

  const handleReport = async () =>{
    setIsLoading(true)
    try {
      await reportComment({
        User: comment.user.Username,
        Content: comment.Content,
        id: comment.$id,
        Reporter: user.name,
      })

      toast({ title: `"${comment.Content}" Reported Successfully!` });
    } catch (error) {
      toast({ title: `Cannot Report Comment because: ${error}` });
    }

    setIsLoading(false)
  }

  const handleReply = () => {
    setReply(true);
    setCommentId(comment.$id);
  };


  const likesComment = comment?.Likes || [];
  const [likes, setLikes] = useState<any[]>(likesComment);

  const handleLikeComment = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    let newLikes = likes.includes(user.id)
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);
    await likeComment(comment.$id, newLikes);
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
          <p className="text-xs">{comment.user.Username}</p>
          <p className="text-base">{comment.Content}</p>
          <button onClick={handleReply} className="text-xs text-blue-600">
            Reply
          </button>
        </div>
        {show && (
          <span className='w-20 flex justify-between'>
          <button onClick={handleReport} className="mt-5 text-xs text-white">
            {isLoading ? <Loader /> : "Report"}
          </button>
          </span>
        )}

<span className="text-white flex flex-col items-center gap-2 py-2 px-4 rounded-lg">
            <img
              src={
                checkIsLiked(likes, user.id)
                  ? "/assets/icons/liked.svg"
                  : "/assets/icons/like.svg"
              }
              alt="like"
              width={20}
              height={20}
              onClick={handleLikeComment}
              className="cursor-pointer"
            />
            <p className="text-base sm:text-sm">{likes.length}</p>
          </span>
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
                <p className="text-blue-600 text-xs">@{reply.userId.Username}</p>
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