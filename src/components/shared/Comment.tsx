const Comment = ({ comment }: any) => {
  return (
    <li
      key={comment.$id}
      className="py-2 flex gap-3 items-start">
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
    </li>
  );
};

export default Comment;
