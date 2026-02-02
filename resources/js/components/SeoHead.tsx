import { Head } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    url?: string;
    schema?: Record<string, any>;
}

export default function SeoHead({
    title,
    description = 'Marketplace UMKM Cipadung - Belanja produk lokal berkualitas langsung dari UMKM desa.',
    image = 'https://umkmcipadung.com/images/hero-marketplace.png',
    type = 'website',
    url,
    schema
}: SeoProps) {
    const siteName = 'Marketplace Cipadung';
    const currentUrl = url || typeof window !== 'undefined' ? window.location.href : '';

    return (
        <Head>
            {/* Standard Meta */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* OpenGraph (Facebook/WA) */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Head>
    );
}
