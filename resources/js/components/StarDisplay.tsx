import { Star } from 'lucide-react';

interface StarDisplayProps {
    rating: number;
    totalRatings?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showCount?: boolean;
    className?: string;
}

export default function StarDisplay({
    rating,
    totalRatings = 0,
    size = 'md',
    showCount = true,
    className = ''
}: StarDisplayProps) {
    const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const textSizes = {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const starSize = sizes[size];
    const textSize = textSizes[size];

    // Generate stars array - max 5 stars
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    if (rating === 0 && totalRatings === 0) {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <Star className={`${starSize} text-muted-foreground/50`} />
                <span className={`${textSize} text-muted-foreground`}>Belum ada rating</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <div className="flex items-center gap-0.5">
                {/* Full stars */}
                {Array.from({ length: fullStars }).map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        className={`${starSize} text-amber-400 fill-amber-400`}
                    />
                ))}

                {/* Half star */}
                {hasHalfStar && (
                    <div className="relative">
                        <Star className={`${starSize} text-muted-foreground/30`} />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star className={`${starSize} text-amber-400 fill-amber-400`} />
                        </div>
                    </div>
                )}

                {/* Empty stars */}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        className={`${starSize} text-muted-foreground/30`}
                    />
                ))}
            </div>

            <span className={`font-semibold ${textSize} text-foreground`}>
                {rating.toFixed(1)}
            </span>

            {showCount && totalRatings > 0 && (
                <span className={`${textSize} text-muted-foreground`}>
                    ({totalRatings})
                </span>
            )}
        </div>
    );
}
