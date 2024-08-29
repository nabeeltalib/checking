import { useEffect, useState } from "react";
import { List, BarChart, ThumbsUp } from "lucide-react";
import { getEmbededLists } from "@/lib/appwrite/api";
import { checkIsLiked } from "@/lib/utils";
import { likeList } from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const EmbedSelector = () => {
  const [embedType, setEmbedType] = useState("top5");
  const [customTitle, setCustomTitle] = useState("");
  const [embedLists, setEmbedLists] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);

  const { user } = useUserContext();
  const userId = user.id;

  useEffect(() => {
    const fetchData = async () => {
      const resp = await getEmbededLists();
      setEmbedLists(resp);

      // Auto-populate customTitle with the first list title
      if (resp && resp.length > 0) {
        setCustomTitle(resp[0].list.Title);
      }
    };

    fetchData();
  }, [refresh]);

  const generateEmbedCode = () => {
    const baseUrl = "https://topfived.com/embed";
    const params = new URLSearchParams({
      type: embedType,
      title: customTitle,
      listId: "12345", // This would be dynamically set based on the user's actual list
    });
    return `<iframe src="${baseUrl}?${params}" width="100%" height="${
      embedType === "top5" ? "300" : "400"
    }" frameborder="0"></iframe>`;
  };

  const handleLikeList = async (list: any) => {
    let likes = list.Likes;
    let newLikes = likes.includes(userId)
      ? likes.filter((Id: any) => Id !== userId)
      : [...likes, userId];
    await likeList(list.$id, newLikes);
    setRefresh((prevState) => !prevState);
  };

  const handleListClick = (list: any) => {
    setCustomTitle(list.Title);
    // Additional functionality for clicking a list (e.g., previewing or selecting it)
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold mb-4 text-center">Embed Your List</h2>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setEmbedType("top5")}
          className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 ${
            embedType === "top5"
              ? "bg-primary-600 text-white shadow-lg transform scale-105"
              : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          <List className="inline-block mr-2" /> Top 5 List
        </button>
        <button
          onClick={() => setEmbedType("leaderboard")}
          className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 ${
            embedType === "leaderboard"
              ? "bg-primary-600 text-white shadow-lg transform scale-105"
              : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          <BarChart className="inline-block mr-2" /> Live Leaderboard
        </button>
      </div>

      <div className="mb-8">
        <label className="block text-lg font-medium mb-2">Custom Title</label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          placeholder="Enter a title for your embed"
        />
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8 shadow-inner">
        <h3 className="font-bold text-lg mb-4">Embed Preview</h3>
        {embedType === "top5" ? (
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border dark:border-zinc-700">
            <h4 className="font-bold text-xl mb-2">{customTitle || "Your Custom Title"}</h4>
            <ol className="list-decimal list-inside space-y-2">
              {embedLists.map((embedlist: any, index: number) => (
                <Link
                  className="block text-primary-500 hover:underline"
                  to={`/embedpreview/${embedlist.list.$id}`}
                  key={embedlist.list.$id}
                  onClick={() => handleListClick(embedlist.list)}
                >
                  {index + 1}. {embedlist.list.Title}
                </Link>
              ))}
            </ol>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border dark:border-zinc-700">
            <h4 className="font-bold text-xl mb-2">{customTitle || "Your Custom Title"}</h4>
            <div className="space-y-4">
              {embedLists.map((embedlist: any, index: number) => (
                <div key={embedlist.list.$id} className="flex justify-between items-center">
                  <span className="text-lg">
                    {index + 1}. {embedlist.list.Title}
                  </span>
                  <div className="flex items-center gap-2">
                    <ThumbsUp
                      size={24}
                      className={`cursor-pointer ${
                        checkIsLiked(embedlist.list.Likes, userId)
                          ? "text-primary-600"
                          : "text-zinc-500"
                      }`}
                      onClick={() => handleLikeList(embedlist.list)}
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {embedlist?.list?.item
                        .map((i: any) => i.userId.length)
                        .reduce((acc: any, length: any) => acc + length, 0) * 5 || 0}{" "}
                      pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-2">Embed Code</h3>
        <textarea
          readOnly
          value={generateEmbedCode()}
          className="w-full h-28 px-4 py-2 text-sm font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      </div>

      <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 p-6 rounded-lg">
        <h3 className="font-bold text-yellow-800 dark:text-yellow-300">
          Understanding the Difference
        </h3>
        <p className="mt-2 text-yellow-700 dark:text-yellow-200">
          <strong>Top 5 List:</strong> A static display of your curated top 5
          items. Perfect for showcasing your final selections or
          recommendations. It's simple, clean, and doesn't change unless you
          update it.
        </p>
        <p className="mt-2 text-yellow-700 dark:text-yellow-200">
          <strong>Live Leaderboard:</strong> An interactive, real-time ranking
          of items that viewers can vote on. Great for engaging your audience
          and getting their opinions. The order can change based on votes,
          making it dynamic and interactive.
        </p>
      </div>
    </div>
  );
};

export default EmbedSelector;
