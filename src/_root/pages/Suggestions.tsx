
const Suggestions = () => {
  return (
    <div className="flex flex-col min-h-screen p-4 bg-white dark:bg-zinc-900">
      <header className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/50x50" alt="Logo" className="w-12 h-12" />
          <input type="text" placeholder="Search" className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white" />
        </div>
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/40x40" alt="User Profile" className="w-10 h-10 rounded-full" />
          <button className="relative">
            <img src="https://placehold.co/24x24" alt="Notifications" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Suggestions</h2>
            {/* Suggestions content here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Suggestions;
