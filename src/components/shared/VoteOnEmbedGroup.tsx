import { likeGroupList } from "@/lib/appwrite/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui";
import { ThumbsUp } from "lucide-react";


const VoteOnEmbedGroup = ({children, item, vote, setVote}:any) => {

    const [id, setId] = useState<string[]>(JSON.parse(localStorage.getItem('uniqueId') || '[]'))

    useEffect(()=>{
      setId(JSON.parse(localStorage.getItem('uniqueId') || '[]'));
    },[vote])

    const [likes, setLikes] = useState<string[]>(() => item.votes || []);
    const { toast } = useToast();

    const hasLiked = useMemo(() => likes.some((item) => id.includes(item)), [likes, id]);
    const uniqueId = likes.find(item => id.includes(item));

    const storeToLocalStorage = (data:string) =>{
        let current = JSON.parse(localStorage.getItem('uniqueId') || '[]');
        current.push(data);
        localStorage.setItem('uniqueId', JSON.stringify(current));
    }

    const removeFromLocalStorage = (data:any) =>{
        let current = JSON.parse(localStorage.getItem('uniqueId') || '[]');
        current = current.filter((item: string) => item !== data);
        localStorage.setItem('uniqueId', JSON.stringify(current));
    }


    const handleLikeList = useCallback(async () => {
        if (!item) return;
        let updatedLikes = [...likes];
        const tempId = `user${Date.now()}:${Math.random().toString(36).substring(2, 15)}`;
        if (hasLiked) {
          updatedLikes = updatedLikes.filter((userId) => userId !== uniqueId);
          removeFromLocalStorage(uniqueId)
        } else if(vote) {
            return;
        }
        else{
            updatedLikes.push(tempId);
            storeToLocalStorage(tempId);
        }

        setLikes(updatedLikes);

        try {
        setId(JSON.parse(localStorage.getItem('uniqueId') || '[]'));
          await likeGroupList(item.$id, {
            votes: updatedLikes,
          });

        } catch (error) {
          console.error("Error liking list:", error);
          setLikes(likes);
          toast({
            title: "Error",
            description: "Failed to update like status. Please try again.",
            variant: "destructive",
          });
        }
        finally{
            setVote((prev:boolean) => !prev)
        }
      }, [likes,id, item, hasLiked, toast]);

  return (
    <div className="flex justify-center flex-col">
        {children}
        <div className="flex justify-center mb-3">
        <Button variant="default" onClick={handleLikeList} className="p-1 w-20">
              <ThumbsUp size={18} className={hasLiked ? "fill-orange-500 text-orange-500" : "text-white"} />
              <span className="ml-1">{likes.length}</span>
        </Button>
        </div>
    </div>
  )
}

export default VoteOnEmbedGroup