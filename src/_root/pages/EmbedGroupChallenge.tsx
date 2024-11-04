import GroupListCard from "@/components/shared/GroupListCard";
import VoteOnEmbedGroup from "@/components/shared/VoteOnEmbedGroup";
import { getGroup } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const EmbedGroupChallenge = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState<any>(null)
    const [vote, setVote] = useState(false)

    useEffect(()=>{
      const fetchData = async ()=>{
        let data = await getGroup(groupId)
        setGroup(data);
      }
      fetchData();
    },[groupId, vote])

    useEffect(()=>{
        if(group?.votes === "many")
        {
            setVote(false)
        }
    },[vote])


  return (
    <div>
       {
        group && <div className="w-full">
             <div className="mt-4 flex flex-col gap-7 justify-center items-center">
              <h3 className="text-center text-3xl text-orange-500 p-3">
                Challenge: {group.challengeTitle} <span className="text-white text-base">({group.days} days time Limit)</span>
              </h3>
        </div> 

        <div className="custom-scrollbar my-4 flex flex-row gap-5 overflow-y-auto w-[100%]">
          {group.groupLists.map((item: any, index: number) => (
            <VoteOnEmbedGroup key={index} item={item} vote={vote} setVote={setVote} >
            <div className="flex my-5 gap-5 items-center">
              <GroupListCard
                list={item.lists}
                creator={item.creator}
                key={index}
              />
              {index !== group.groupLists.length - 1 && (
                <span className="text-xl font-bold">VS</span>
              )}
            </div>
            </VoteOnEmbedGroup>
          ))}
        </div>
        </div>
       }
    </div>
  )
}

export default EmbedGroupChallenge