import ListCard2 from "@/components/shared/ListCard2"
import { getPopularLists } from "@/lib/appwrite/api"
import { useEffect, useState } from "react"


const Trending = () => {

    const [trending, setTrending] = useState<any>([])

    useEffect(()=>{
        const fetchData = async ()=>{
            const data = await getPopularLists();
            setTrending(data)
        }

        fetchData()
    },[])


  return (
    <div>
        <h1 className="text-3xl">Trending List's</h1>
       <div className="mt-5 flex flex-col">
       {trending.map((list:any, index:number)=> (
            <ListCard2 list={list} key={index}/>
        ))}
       </div>

    </div>
  )
}

export default Trending