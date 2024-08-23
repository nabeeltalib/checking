import React, { useEffect, useState } from "react";
import ListCard2 from "@/components/shared/ListCard2";
import { getPopularLists } from "@/lib/appwrite/api";

const Recomended = () => {
    const [recomended, setRecomended] = useState<any>([]);
    const [isContentLoaded, setIsContentLoaded] = useState(false); // Manage content loaded state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPopularLists();
                setRecomended(data);
                // After data is fetched, wait for a moment to allow the component to fully render
                setIsContentLoaded(true);
            } catch (error) {
                console.error('Failed to fetch recommended lists:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isContentLoaded) {
            // Hide the main loader once content is fully loaded
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }, [isContentLoaded]);

    if (!isContentLoaded) {
        // While loading, display the loader and "Loading..." text
        return (
            <div className="flex justify-center items-center h-screen bg-black text-white">
                <div className="text-center">
                    <img src="/assets/images/mobile.png" width={200} alt="Loading..." className="mx-auto mb-4" />
                    <h1 className="text-2xl flashing">Loading Recommended Lists...</h1>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>Recommended Lists</h1>
            <div className="mt-5 flex flex-col">
                {recomended.map((list: any, index: number) => (
                    <ListCard2 list={list} key={index} />
                ))}
            </div>
        </div>
    );
};

export default Recomended;
