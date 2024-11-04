import { Loader } from "@/components/shared"
import Group from "@/components/shared/Group"
import { useUserContext } from "@/context/AuthContext"
import { getGroups } from "@/lib/appwrite/api"
import { useEffect, useState } from "react"
import GroupCard from '@/components/shared/GroupCard';

const Groups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const { user } = useUserContext();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(()=>{
    const fetchData = async ()=>{
      setIsFetching(true);
      try {

      let data = await getGroups()
      let filteredGroups = data.filter((item: any)=>{
        if(item.viewers.length > 0)
        {
          return item.viewers.includes(user.id);
        }

        return true
      });

      setGroups(filteredGroups);

    } catch (error) {
     console.log("Error: ",error);   
    }  
    finally{
        setIsFetching(false)
      }
    }
    fetchData();
  },[])


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isFetching ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader />
        </div>
      ) : (
        <div className="space-y-8">
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <GroupCard
                key={index}
                group={group}
                currentUser={user}
                onVote={(listId) => handleVote(listId)}
                onComment={(comment) => handleComment(comment)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              No groups available
            </div>
          )}
        </div>
      )}
    </div>  
  )
}

export default Groups