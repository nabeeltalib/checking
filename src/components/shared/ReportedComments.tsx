import { Button, useToast } from "../ui"
import { useState } from "react"
import { deleteComment, deleteReportedComment } from "@/lib/appwrite/api"
import Loader from "./Loader"

const ReportedComments = ({comment, setRefresh}:any) => {
    const [isLoadingDelete, setIsLoadingDelete] = useState(false)
    const [isLoadingIgnore, setIsLoadingIgnore] = useState(false)

    const { toast } = useToast();

    const handleDelete = async ()=>{
        setIsLoadingDelete(true)

        try {
            await deleteComment(comment.commentId)
            await deleteReportedComment(comment.$id)
            setRefresh((prev:any)=> !prev)
            toast({ title: `"${comment.commentContent}" Deleted Successfully!` });
        } catch (error) {
            toast({ title: `${error}` });
        }

        setIsLoadingDelete(false)
    }

    const handleIgnore = async ()=>{
        setIsLoadingIgnore(true)

        try {
            await deleteReportedComment(comment.$id)
            setRefresh((prev:any)=> !prev)
            toast({ title: `"${comment.commentContent}" Ignored Successfully!` });
        } catch (error) {
            toast({ title: `${error}` });
        }

        setIsLoadingIgnore(false)
    }

  return (
    <div>
        <div className="w-3/5 bg-slate-800 rounded-xl p-4">
          <p className="text-xl font-bold">{comment.commentContent}</p>
          <p className="text-base">
             Commented By:   <span className="text-blue-600">@{comment.commentedBy}</span>
          </p>
          <p className="text-base">
             Reported By:   <span>{comment.ReportedBy}</span>
          </p>

          <p className="mt-3">
          <Button onClick={handleDelete} className="mr-3">
          {isLoadingDelete ? <Loader /> : "Delete Comment"}
          </Button>
          <Button onClick={handleIgnore}>
            {isLoadingIgnore ? <Loader /> : "Ignore Comment"}
          </Button>
          </p>
        </div>
    </div>
  )
}

export default ReportedComments