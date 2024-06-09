import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetListById } from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';
import ListForm from '@/components/forms/ListForm';
import { useUserContext } from '@/context/AuthContext';

const EditList = () => {
  const { id } = useParams();
  const { data: list, isLoading, isError } = useGetListById(id);
  const { user } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (list && user && list.creator.$id !== user.id) {
      navigate(`/lists/${id}`);
    }
  }, [list, user, id, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !list) {
    return <div>Error loading list. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col gap-6 w-full p-6 mx-auto">
        <div className="flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit List</h2>
        </div>

        <ListForm action="Update" list={list} />
      </div>
    </div>
  );
};

export default EditList;
