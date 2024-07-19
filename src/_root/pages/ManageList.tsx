import { useParams } from 'react-router-dom';
import { useGetUserLists } from "@/lib/react-query/queries";
import ListCard2 from '@/components/shared/ListCard2';

const ManageList = () => {

  const { id } = useParams();
  const { data: userLists} = useGetUserLists(id || "");


  return (
    <div className='flex flex-col gap-3'>
      {
        userLists?.map((list:any, index:number)=>(
          <ListCard2 list={list} key={index} />
        ))
      }
        
    </div>
  )
}

export default ManageList