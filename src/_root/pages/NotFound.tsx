import { useNavigate } from 'react-router-dom';
import { Home, Search, List } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Oops! Page Not Found</h2>
      <p className="text-xl mb-8 text-center">
        Looks like this page took a detour from your Top Five list!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          <Home size={20} />
          Go Home
        </button>
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
        >
          <Search size={20} />
          Explore Lists
        </button>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <List size={20} />
          Create a List
        </button>
      </div>
      <p className="text-gray-600">
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
};

export default NotFound;