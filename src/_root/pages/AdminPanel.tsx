import { Button } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListData } from "../data/List";
import { userData } from "../data/user";
import { createList, getReportedComments } from "@/lib/appwrite/api";
import { Loader } from "@/components/shared";


const AdminPanel = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)
    const [reportedComments, setReportedComments] = useState<any>([])
    const [refresh, setRefresh] = useState(false)

    useEffect(()=>{
        if(!user.isAdmin)
        {
            navigate("/")
        }
    },[user])
    
    useEffect(()=>{
            const fetchData = async()=>{
                let data = await getReportedComments()
                setReportedComments(data);
            }

            fetchData()
        },[refresh, user])

    const { mutateAsync: createUserAccount} = useCreateUserAccount();

    const handleBulkUpload = async() =>{
        setIsLoading(true)
        for(let item of userData)
        {
           await createUserAccount(item)
        }

        for(let item of ListData)
        {
            await createList(item,user.id)
        }
        setIsLoading(false)
    }


  return (
    <div>
        <h1 className="text-3xl text-center">Welcome {user.name}</h1>

        <p className="mt-8">In order to Create 100 lists and 10 users click below</p>
        <Button onClick={handleBulkUpload}>{isLoading ? <Loader /> : "Bulk Upload"}</Button>

        <h1 className="text-2xl mb-3 mt-4">Review Reported Comments</h1>
        {
            reportedComments && reportedComments.length > 0 ? reportedComments.map((comment:any)=> <ReportedComments comment={comment} setRefresh={setRefresh} key={comment.$id} />) :  "No Reported Comments.."
        }
    </div>
  )
}

export default AdminPanel