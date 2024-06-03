import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { ListStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type ListCardProps = {
  list: Models.Document;
};

const ListCard = ({ list }: ListCardProps) => {
  const { user } = useUserContext();

  if (!list.creator) return;

  return (
    <div className="list-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${list.creator.$id}`}>
            <img
              src={
                list.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {list.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(list.$createdAt)}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-list/${list.$id}`}
          className={`${user.id !== list.creator.$id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/lists/${list.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <h3 className="font-bold">{list.title}</h3>
          <p>{list.description}</p>
          <ul className="list-disc list-inside mt-2">
            {list.items.map((item, index) => (
              <li key={index} className="text-light-1">
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