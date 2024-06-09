import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useCreateCollaboration } from "@/lib/react-query/queries";

interface UserDocument extends Models.Document {
  imageUrl?: string;
  name: string;
  username: string;
}

type UserCardProps = {
  user: UserDocument;
  listId: string;
};

const UserCard = ({ user, listId }: UserCardProps) => {
  const { mutate: createCollaboration } = useCreateCollaboration();

  const handleCollaborate = () => {
    createCollaboration({
      listId,
      userId: user.$id,
      status: "pending",
    });
  };

  return (
    <div className="user-card flex items-center gap-4 p-4 bg-dark-3 rounded-lg">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={`${user.name}'s profile`}
        className="rounded-full w-14 h-14 object-cover"
      />

      <div className="flex flex-col flex-1">
        <Link to={`/profile/${user.$id}`} className="base-medium text-light-1 text-left line-clamp-1">
          {user.name}
        </Link>
        <p className="small-regular text-light-3 text-left line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className="shad-button_primary px-5"
        aria-label={`Collaborate with ${user.name}`}
        onClick={handleCollaborate}
      >
        Collaborate
      </Button>
    </div>
  );
};

export default UserCard;