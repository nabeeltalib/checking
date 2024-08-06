const Comment = ({ comment, setReply, show, setCommentId }: any) => {

  const handleReply = async ()=>{
      setReply(true)
      setCommentId(comment.$id)
  }

  return (
    <div className="mb-2">
    <li key={comment.$id} className="py-2 flex gap-3 items-start">
      <img
        src={comment.user.ImageUrl}
        alt="userImage"
        className="rounded-full"
        width={40}
        height={40}
      />
      <div>
        <p className="text-blue-600 text-sm">@{comment.user.Username}</p>
        <p className="text-base">{comment.Content}</p>
      </div>
          {show ? <button onClick={handleReply} className="mt-5 text-blue-600">Reply</button> : ""}
      </li>

    {comment.Reply ? comment.Reply.map((reply: any, index: number) => (
          <div className="ml-8 flex items-center gap-3 mb-2" key={index}>
            <img
              src={reply.userId.ImageUrl}
              alt="userImage"
              className="rounded-full"
              width={40}
              height={40}
            />
            <div>
              <p className="text-blue-600 text-sm">@{reply.userId.Username}</p>
              <p className="text-base">{reply.Content}</p>
            </div>
          </div>
        )) : ""}
        
    </div>
  )
  
  
};

export default Comment;
