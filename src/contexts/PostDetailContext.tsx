import { createContext, useContext, useState, ReactNode } from "react";

interface PostDetailContextType {
  isPostDetailOpen: boolean;
  setIsPostDetailOpen: (open: boolean) => void;
}

const PostDetailContext = createContext<PostDetailContextType | undefined>(undefined);

export const PostDetailProvider = ({ children }: { children: ReactNode }) => {
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  return (
    <PostDetailContext.Provider value={{ isPostDetailOpen, setIsPostDetailOpen }}>
      {children}
    </PostDetailContext.Provider>
  );
};

export const usePostDetail = () => {
  const context = useContext(PostDetailContext);
  if (!context) {
    throw new Error("usePostDetail must be used within a PostDetailProvider");
  }
  return context;
};
