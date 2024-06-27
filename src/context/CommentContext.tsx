import { createContext, useContext, useState, ReactNode } from "react";

interface CommentContextProps {
  comments: any[];
  addComment: (comment: any) => void;
}

const CommentContext = createContext<CommentContextProps | undefined>(undefined);

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<any[]>([]);

  const addComment = (comment: any) => {
    setComments((prevComments) => [...prevComments, comment]);
  };

  return (
    <CommentContext.Provider value={{ comments, addComment }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};
