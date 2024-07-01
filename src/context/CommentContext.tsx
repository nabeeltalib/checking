import React, { createContext, useContext, useState, ReactNode } from "react";
import { IComment } from "@/types";

interface CommentContextProps {
  comments: IComment[];
  addComment: (comment: IComment) => void;
}

const CommentContext = createContext<CommentContextProps | undefined>(undefined);

export const CommentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<IComment[]>([]);

  const addComment = (comment: IComment) => {
    setComments((prevComments) => [...prevComments, comment]);
  };

  return (
    <CommentContext.Provider value={{ comments, addComment }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = (): CommentContextProps => {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};