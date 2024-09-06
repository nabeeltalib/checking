import EmbedComponent from "@/components/shared/embedComponent";
import ListCard2 from "@/components/shared/ListCard2";
import { getEmbededLists } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";


const EmbedList = () => {

const [embedLists, setEmbedLists] = useState<any>([]);
const [refresh, setRefresh] = useState(false);
useEffect(() => {
    const fetchData = async () => {
    const resp = await getEmbededLists();
    setEmbedLists(resp);
    };
    
    fetchData();
}, [refresh]);

  return (
    <div>
        <h1 className="text-3xl text-center">Embed Your Ranking in your Site</h1>
        <h3 className="font-bold mt-2">Understanding the Differences</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit nulla enim assumenda inventore dolore esse blanditiis unde, ratione possimus illo reiciendis quisquam magni obcaecati ut autem aliquid est. Debitis accusantium</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit nulla enim assumenda inventore dolore esse blanditiis unde, ratione possimus illo reiciendis quisquam magni obcaecati ut autem aliquid est. Debitis accusantium omnis</p>
        <div className="flex flex-col gap-3">
        {
            embedLists && embedLists.map((list:any)=>{
                return <div className="mt-3"> <ListCard2 list={list.list} /> </div>
            })
        }
        </div>
    </div>
  )
}

export default EmbedList