import React, { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetListById,
  useGetRelatedLists, 
  useDeleteList,
  useGetUserById
} from '@/lib/react-query/queries';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/shared';
import GridListList from '@/components/shared/GridListList';
import ListStats from '@/components/shared/ListStats';
import { useToast } from '@/components/ui/use-toast';
import { IListItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: list, isLoading } = useGetListById(id || '');
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();
  const { data: relatedLists, isLoading: isRelatedListsLoading } = useGetRelatedLists(id || '');
  const { data: listCreator, isLoading: isCreatorLoading } = useGetUserById(list?.creator.$id || '');

  const visibleItems = useMemo(() => {
    if (!list) return [];
    return list.items.slice(0, 5);
  }, [list]);

  const handleDeleteList = async () => {
    if (!id) return;
    try {
      await deleteList(id);
      toast({ title: 'List deleted successfully!' });
      navigate(-1);
    } catch (error) {
      toast({ title: 'Error deleting list', variant: 'destructive' });
    }
  };

  if (isLoading || isCreatorLoading) return <Loader />;
  if (!list || !listCreator) return <div className="text-center text-light-1">List not found</div>;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-dark-1 p-4 border-b border-dark-4">
        <button onClick={() => navigate(-1)} className="text-primary-500 font-bold">
          &larr; Back
        </button>
      </div>

      <div className="p-4 border-b border-dark-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex flex-col items-center">
            <img
              src={listCreator.imageUrl || '/assets/icons/profile-placeholder.svg'}
              alt="creator"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex gap-4 mt-2 text-sm text-light-2">
              <span>{listCreator.followersCount || 0} followers</span>
              <span>{listCreator.followingCount || 0} following</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-light-1">{listCreator.name}</p>
            <p className="text-light-3">@{listCreator.username}</p>
            <Link to={`/profile/${listCreator.$id}`} className="text-primary-500 text-sm mt-1 block">
              View Profile
            </Link>
          </div>
        </div>

        <h2 className="text-xl font-bold text-light-1 mb-2">{list.title}</h2>
        
        <ul className="mb-4">
          {visibleItems?.map((item: IListItem, index: number) => (
            <li key={index} className="mb-2 text-light-2">
              {index + 1}. {item?.content || item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 mb-4">
          {list?.tags?.map((tag: string, index: number) => (
            <span key={`${tag}${index}`} className="text-primary-500">
              #{tag}
            </span>
          ))}
        </div>

        <p className="text-light-3 text-sm mb-4">
          {formatDistanceToNow(new Date(list.$createdAt), { addSuffix: true })}
        </p>

        <ListStats list={list} userId={user.id} />

        {list?.creator?.$id === user.id && (
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => navigate(`/update-list/${list?.$id}`)}
              className="bg-primary-500 text-light-1 px-4 py-2 rounded-full">
              Edit List
            </Button>
            <Button
              onClick={handleDeleteList}
              className="bg-red-500 text-light-1 px-4 py-2 rounded-full"
              disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete List'}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-light-1 mb-4">Related Lists</h3>
        {isRelatedListsLoading ? (
          <Loader />
        ) : relatedLists && relatedLists.length > 0 ? (
          <GridListList lists={relatedLists} />
        ) : (
          <p className="text-light-2">No related lists found</p>
        )}
      </div>
    </div>
  );
};

export default ListDetails;