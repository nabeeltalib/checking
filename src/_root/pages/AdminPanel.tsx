import { Button } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListData } from "../data/List";
import { userData } from "../data/user";
import { createList } from "@/lib/appwrite/api";
import { Loader } from "@/components/shared";


const AdminPanel = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        if(!user.isAdmin)
        {
            navigate("/")
        }
    },[user])

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
    </div>
  )
}

export default AdminPanel