import { useState, useRef } from 'react';
import { Check } from 'lucide-react';

interface SwipeButtonProps {
    onSuccess: () => void;
    label?: string;
    successLabel?: string;
    disabled?: boolean;
}

export function SwipeButton({
    onSuccess,
    label = 'Geser untuk konfirmasi',
    successLabel = 'Selesai!',
    disabled = false,
}: SwipeButtonProps) {
    const [completed, setCompleted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [translateX, setTranslateX] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);

    const handleWidth = 64; // w-16
    const getMaxTranslate = () => {
        if (!containerRef.current) return 200;
        return containerRef.current.clientWidth - handleWidth - 16;
    };

    const handleTouchStart = () => {
        if (disabled || completed) return;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging || disabled || completed) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const containerLeft = containerRef.current?.getBoundingClientRect().left || 0;
        const newX = Math.max(0, Math.min(clientX - containerLeft - handleWidth / 2, getMaxTranslate()));
        setTranslateX(newX);
    };

    const handleTouchEnd = () => {
        if (!isDragging || disabled || completed) return;
        setIsDragging(false);

        if (translateX >= getMaxTranslate() * 0.9) {
            setCompleted(true);
            setTranslateX(getMaxTranslate());
            onSuccess();
        } else {
            setTranslateX(0);
        }
    };

    if (disabled) {
        return (
            <div className="w-full h-16 bg-muted rounded-2xl flex items-center justify-center">
                <span className="text-muted-foreground font-medium">{label}</span>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="w-full h-16 bg-success rounded-2xl flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-white" />
                <span className="text-white font-medium">{successLabel}</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-16 rounded-2xl overflow-hidden border-2 border-primary/20 bg-primary/5"
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary/60 font-medium text-sm">{label}</span>
            </div>

            {/* Draggable handle */}
            <div
                ref={handleRef}
                onMouseDown={handleTouchStart}
                onTouchStart={handleTouchStart}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-12 bg-primary rounded-xl shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                </svg>
            </div>
        </div>
    );
}
