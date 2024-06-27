import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetComments, useCreateComment } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "@/components/shared";

const Comments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { data: comments, isLoading } = useGetComments(id!);
  const { mutate: createComment } = useCreateComment();
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      await createComment({
        listId: id!,
        userId: user.id,
        content: newComment,
      });

      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-white dark:bg-zinc-900">
      <header className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center space-x-4">
          <img src="/assets/icons/logo.svg" alt="Logo" className="w-12 h-12" />
          <input
            type="text"
            placeholder="Search"
            className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-4">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="User Profile"
            className="w-10 h-10 rounded-full"
          />
          <button className="relative">
            <img src="/assets/icons/notifications.svg" alt="Notifications" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Post Comment
              </button>
            </form>
            <div>
              {comments?.documents.length > 0 ? (
                comments.documents.map((comment: any) => (
                  <div
                    key={comment.$id}
                    className="mb-4 p-4 border rounded-lg dark:border-zinc-700"
                  >
                    <div className="flex items-center space-x-4 mb-2">
                      <img
                        src={comment.userImageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm dark:text-white">
                        {comment.userName}
                      </span>
                    </div>
                    <p className="dark:text-gray-300">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Comments;