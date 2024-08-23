import { useNavigate } from "react-router-dom";

const FAB = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/create-list");
  };

  return (
    <button
      className="fixed bottom-6 right-6 bg-primary-500 text-white rounded-full p-4 shadow-lg hover:bg-primary-600 transition-transform transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-300"
      onClick={handleClick}
      aria-label="Create New List"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};

export default FAB;
