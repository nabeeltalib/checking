import { useEffect, useState } from "react";
import { Button } from "../ui";
import {
  useCreateGroupComment,
  useGetGroupComments,
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import {
  createReply,
  updateCommentWithReply,
  updateReplyWithReply,
} from "@/lib/appwrite/api";
import { toast } from "../ui";
import { AnimatePresence, motion } from "framer-motion";
import Comment from "./Comment";
import { ChevronUp, Plus } from "lucide-react";
import GroupListCard from "./GroupListCard";
import { Link } from "react-router-dom";

const Group = ({ group }: any) => {
  const { user } = useUserContext();
  const { id } = user;
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [areAllCommentsVisible, setAreAllCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { data: comments, refetch: refetchComments } = useGetGroupComments(group.$id);
  const [isReply, setIsReply] = useState(false);
  const [visibleComments, setVisibleComments] = useState<any>([]);
  const [commentId, setCommentId] = useState("");
  const [parentReplyId, setParentReplyId] = useState("");
  const { mutate: createGroupComment } = useCreateGroupComment();
  const [combinedList, setCombinedList] = useState<any[]>([])

  useEffect(() => {
    setVisibleComments(
      areAllCommentsVisible ? comments : comments?.slice(0, 3) || []
    );
  }, [comments, areAllCommentsVisible]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      if (isReply) {
        const replyData: any = {
          userId: id,
          Content: newComment,
        };

        if (commentId) {
          replyData.commentId = commentId;
        }
        if (parentReplyId) {
          replyData.parentReplyId = parentReplyId;
        }

        const newReply = await createReply(replyData);

        if (newReply) {
          if (parentReplyId) {
            // Replying to a reply
            await updateReplyWithReply(parentReplyId, newReply.$id);
          } else {
            // Replying to a comment
            await updateCommentWithReply(commentId, newReply.$id);
          }
        }
      } else {
        await createGroupComment({
          groupId: group.$id,
          userId: id,
          Content: newComment,
        });
      }

      setNewComment("");
      setIsReply(false);
      setCommentId("");
      setParentReplyId("");
      refetchComments();
      toast({
        title: "Success",
        description: isReply
          ? "Reply added successfully"
          : "Comment posted successfully",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment or reply.",
        variant: "destructive",
      });
    }
  };

  const toggleCommentVisibility = () => {
    setAreAllCommentsVisible(!areAllCommentsVisible);
  };

  useEffect(() => {
    if (group?.groupLists && Array.isArray(group.groupLists) && group.noOfLists != null) {
      const placeholdersNeeded = group.noOfLists - group.groupLists.length;

      setCombinedList([
        ...group.groupLists, 
        ...Array.from({ length: Math.max(0, placeholdersNeeded) }, () => null) 
      ]);
    }
  }, [group]);

  return (
    <div>
      <div className="flex flex-col justify-center items-center w-full">
      <Link to={`/group/${group.$id}`}>
      <div className="mt-4 flex flex-col gap-7 justify-center items-center">
        <h3 className=" text-center text-2xl p-3">
          {group.header}
        </h3>
        <h3 className="text-center text-3xl text-orange-500 p-3">
          Challenge: {group.challengeTitle} <span className="text-white text-base">({group.days} days time Limit)</span>
        </h3>
      </div>
      </Link>
{ group.noOfLists === null &&
  <div className="custom-scrollbar my-4 flex flex-row gap-5 overflow-y-auto w-[60vw]">
    {group.groupLists.map((item: any, index: number) => (
      <div key={index} className="flex my-5 gap-5 items-center">
        <Link to={`/group/${group.$id}`}>
        <GroupListCard
          list={item.lists}
          creator={item.creator} 
          noAction={true}
        />
        </Link>
        {index !== group.groupLists.length - 1 && (
          <span className="text-xl font-bold">VS</span>
        )}
      </div>
    ))}
  </div>}

{group.noOfLists !== null &&
  <div className="custom-scrollbar my-4 flex flex-row gap-5 overflow-y-auto w-[60vw]">
    {combinedList.map((item: any, index: number) => (
      item ?
      <div key={index} className="flex my-5 gap-5 items-center">
        <Link to={`/group/${group.$id}`}>
        <GroupListCard
          list={item.lists}
          creator={item.creator}
          noTitle={true}
          noAction={true}
        />
        </Link>
        {index !== group.groupLists.length - 1 && (
          <span className="text-xl font-bold">VS</span>
        )}
      </div>

      :

      <div key={index} className="flex my-5 gap-5 items-center">
            <Link className="bg-slate-900 min-w-[250px] rounded-md min-h-[350px] flex justify-center items-center" to={`/create-list/${group.challengeTitle.replace(/\s+/g, '-')}/${group.$id}`}>
              <Plus width={100} />
            </Link>

            {index !== combinedList.length - 1 && (
              <span className="text-xl font-bold">VS</span>
            )}
      </div>

    ))}
  </div>}




      <Button
        className="bg-slate-900 w-[60vw]"
        onClick={() => setIsCommentsExpanded((prev) => !prev)}>
        Comments for this group
      </Button>
      {/* Comments Section */}
      <AnimatePresence>
        {isCommentsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 w-[60vw]">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {(comments?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {visibleComments.map((comment: any) => (
                  <Comment
                    key={comment.$id}
                    comment={comment}
                    setReply={setIsReply}
                    show={true}
                    setCommentId={setCommentId}
                    setParentReplyId={setParentReplyId} // Add this line
                  />
                ))}

                {(comments?.length ?? 0) > 3 && (
                  <div className="flex justify-between items-center mt-2">
                    <Button
                      variant="link"
                      onClick={toggleCommentVisibility}
                      className="text-blue-300 flex items-center">
                      {areAllCommentsVisible ? (
                        <>
                          <ChevronUp className="mr-2" size={16} />
                          Show less
                        </>
                      ) : (
                        <p className={`text-base text-gray-500`}>
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-base text-gray-500`}>
                No comments yet. Be the first to comment!
              </p>
            )}
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={newComment}
                spellCheck={true} // Enable spellcheck here
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isReply ? "Write a reply..." : "Write a comment..."
                }
                className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                rows={1}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit" variant="default">
                  {isReply ? "Post Reply" : "Post Comment"}
                </Button>
                {isReply && (
                  <Button onClick={() => setIsReply(false)} variant="outline">
                    Cancel Reply
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Group;