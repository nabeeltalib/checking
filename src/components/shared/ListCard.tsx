import { Models } from "appwrite";
import { Link } from "react-router-dom";

import ListStats from "@/components/shared/ListStats";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type ListCardProps = {
  list: Models.Document;
};

const ListCard = ({ list }: ListCardProps) => {
  const { user } = useUserContext();

  if (!list.creator) return null;

  return (
    <div className="list-card bg-dark-2 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${list.creator.$id}`}>
            <img
              src={list.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${list.creator.name}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {list.creator.name}
            </p>
            <div className="flex items-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(list.$createdAt)}
              </p>
            </div>
          </div>
        </div>

        {user.id === list.creator.$id && (
          <Link to={`/update-list/${list.$id}`}>
            <img
              src="/assets/icons/edit.svg"
              alt="edit"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </Link>
        )}
      </div>

      <Link to={`/lists/${list.$id}`} className="block mt-4">
        <div className="small-medium lg:base-medium py-2">
          <h3 className="font-bold text-light-1">{list.title}</h3>
          <p className="text-light-3 mt-1">{list.description}</p>
          <ul className="list-disc list-inside mt-2 text-light-1">
            {list.items.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-2">
            {list.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-dark-4 text-light-3 rounded-full px-2 py-1 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <ListStats list={list} userId={user.id} />
    </div>
  );
};

export default ListCard;
