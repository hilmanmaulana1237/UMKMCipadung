import { useState, useEffect } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
}

export default function CachedImage({ src, ...props }: CachedImageProps) {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [isCached, setIsCached] = useState(false);

    useEffect(() => {
        // Skip caching for data URIs or empty sources
        if (!src || src.startsWith('data:')) return;

        const cacheKey = `img_cache_${src}`;

        try {
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                // Check if cache is expired (optional, but good practice) - for now just use it
                setImageSrc(cached);
                setIsCached(true);
            } else {
                // Fetch and cache
                fetch(src, { mode: 'cors' }) // Ensure cross-origin images work if allowed
                    .then(async (res) => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        const blob = await res.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result as string;
                            try {
                                localStorage.setItem(cacheKey, base64data);
                                setImageSrc(base64data);
                                setIsCached(true);
                            } catch (e) {
                                // If quota exceeded, clear old cache items?
                                // For now, just warn and don't cache
                                console.warn('LocalStorage quota exceeded or error, image not cached:', src);
                            }
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(err => {
                        // Silent fail, just keep original src
                        // console.warn('Error caching image:', err);
                    });
            }
        } catch (e) {
            // Access to localStorage might be denied
        }
    }, [src]);

    return <img src={imageSrc} {...props} />;
}
