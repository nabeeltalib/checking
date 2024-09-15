import { useState, useEffect } from 'react';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
});

const useUnsplashImage = (query: string) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cachedImage = localStorage.getItem(`unsplash_${query}`);
        if (cachedImage) {
          setImage(JSON.parse(cachedImage));
          setLoading(false);
          return;
        }

        const result = await unsplash.photos.getRandom({
          query,
          orientation: 'landscape',
        });
        
        if (result.type === 'success') {
          const imageUrl = result.response.urls.regular;
          // Cache the result
          localStorage.setItem(`unsplash_${query}`, JSON.stringify(imageUrl));
          setImage(imageUrl);
        } else {
          throw new Error('Failed to fetch image');
        }
      } catch (err) {
        console.error('Error fetching Unsplash image:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        // Use a placeholder image as fallback
        setImage(`https://via.placeholder.com/800x400?text=${encodeURIComponent(query)}`);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchImage();
    }
  }, [query]);

  return { image, loading, error };
};

export default useUnsplashImage;