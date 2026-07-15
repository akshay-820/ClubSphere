import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PostMediaCarousel({ mediaUrls = [], className = "" }) {
    const urls = Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : [];
    const [activeIndex, setActiveIndex] = useState(0);

    if (urls.length === 0) return null;

    const hasMultiple = urls.length > 1;

    const showPrevious = (e) => {
        e.stopPropagation();
        setActiveIndex((index) => (index === 0 ? urls.length - 1 : index - 1));
    };

    const showNext = (e) => {
        e.stopPropagation();
        setActiveIndex((index) => (index === urls.length - 1 ? 0 : index + 1));
    };

    return (
        <div
            className={`relative mt-4 overflow-hidden rounded-xl border border-[#252546] bg-black ${className}`}
        >
            <a
                href={urls[activeIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[320px] sm:h-[430px] lg:h-[520px] w-full items-center justify-center bg-black"
            >
                <img
                    src={urls[activeIndex]}
                    alt={`Post media ${activeIndex + 1}`}
                    className="h-full w-full object-contain"
                />
            </a>

            {hasMultiple && (
                <>
                    <button
                        type="button"
                        onClick={showPrevious}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black/90"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={showNext}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black/90"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                        {activeIndex + 1}/{urls.length}
                    </div>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
                        {urls.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex(index);
                                }}
                                className={`h-1.5 rounded-full transition-all ${
                                    index === activeIndex
                                        ? "w-5 bg-white"
                                        : "w-1.5 bg-white/40 hover:bg-white/70"
                                }`}
                                aria-label={`Show image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
