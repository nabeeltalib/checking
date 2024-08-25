import { useParams } from 'react-router-dom';
import ListCard2 from '@/components/shared/ListCard2';
import { useEffect, useState } from 'react';
import { getUserById } from '@/lib/appwrite/config';


const ManageList = () => {

  const { id } = useParams();
  const [userLists, setUserLists] = useState<any>([])

  useEffect(()=>{
      const fetchData = async()=>{
        let resp = await getUserById(id);
        console.log(resp)
        setUserLists(resp?.lists)
      }

      fetchData()
  },[id])

  return (
    <div className='flex flex-col gap-3'>
      {
        userLists?.map((list:any, index:number)=>(
          <ListCard2 list={list} key={index} manageList={true} />
        ))
      }
        
    </div>
  )
}

export default ManageList