
import { useAcceptFriendRequest, useRejectFriendRequest } from '@/lib/react-query/queries';

interface FriendRequest {
  $id: string;
  userId: string;
  name: string;
  imageUrl: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
}

const FriendRequests = ({ requests }:any) => {
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  if (requests.length === 0) {
    return <p className="text-light-2">No pending friend requests.</p>;
  }


  return (
    <div className="space-y-4">
      {requests.map((request:any, index:number) => (
        <div key={index} className="flex items-center justify-between bg-dark-3 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <img
              src={request.userId.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${request.userId.Name}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-light-1 font-medium">{request.userId.Name}</span>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleAccept(request.$id)}
              className="bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600 transition"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(request.$id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;