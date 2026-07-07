import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Trash2 } from "lucide-react";

/**
 * ImageUploader
 *
 * Props:
 *  - currentUrl   : string | null — the existing image URL to show as preview
 *  - onFileSelect : (file: File | null) => void — called when user picks/drops a file or removes it
 *  - shape        : 'circle' | 'square' (default 'square')
 *  - label        : string — short label shown below the drop zone
 *  - accept       : string (default 'image/*')
 *  - maxMB        : number (default 5)
 *  - uploading    : boolean — shows a spinner overlay while parent is uploading
 *  - error        : string | null — inline error message
 */
export function ImageUploader({
    currentUrl = null,
    onFileSelect,
    shape = "square",
    label = "Upload image",
    accept = "image/*",
    maxMB = 5,
    uploading = false,
    error = null,
}) {
    const [preview, setPreview] = useState(null); // local blob URL from a picked file
    const [removed, setRemoved] = useState(false); // user explicitly cleared the image
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState(null);
    const inputRef = useRef(null);

    // What to render: local blob > currentUrl prop (unless user removed it)
    const displayUrl = removed ? null : preview || currentUrl;

    const validate = (file) => {
        if (!file.type.startsWith("image/"))
            return "Please select an image file.";
        if (file.size > maxMB * 1024 * 1024)
            return `Image must be under ${maxMB} MB.`;
        return null;
    };

    const handleFile = useCallback(
        (file) => {
            if (!file) return;
            const err = validate(file);
            if (err) {
                setLocalError(err);
                return;
            }
            setLocalError(null);
            setRemoved(false); // picking a new file un-removes
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        },
        [onFileSelect, maxMB],
    );

    const onInputChange = (e) => {
        handleFile(e.target.files?.[0]);
        e.target.value = ""; // allow re-selecting the same file
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    };
    const onDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    const onDragLeave = () => setDragOver(false);

    // Called when user wants to remove the current image (new file or existing)
    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        setRemoved(true);
        setLocalError(null);
        onFileSelect(null);
    };

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
    const displayError = localError || error;

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* ── Wrapper: relative so the square X button can sit outside overflow-hidden ── */}
            <div
                className={`relative w-full ${shape === "circle" ? "w-28" : ""}`}
            >
                {/* Drop zone */}
                <div
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) =>
                        e.key === "Enter" && inputRef.current?.click()
                    }
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={[
                        "image-uploader-zone group relative flex items-center justify-center cursor-pointer select-none overflow-hidden",
                        shape === "circle"
                            ? "w-28 h-28 rounded-full"
                            : "w-full h-40 rounded-2xl",
                        dragOver
                            ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
                            : "border-[#2a2a4a] bg-white/[0.03] hover:border-blue-500/50 hover:bg-blue-500/5",
                        "border-2 border-dashed transition-all duration-200",
                    ].join(" ")}
                    style={{ outline: "none" }}
                >
                    {/* Current / preview image */}
                    {displayUrl && (
                        <img
                            src={displayUrl}
                            alt="preview"
                            className={`absolute inset-0 w-full h-full object-cover ${shapeClass}`}
                        />
                    )}

                    {/* Uploading spinner overlay */}
                    {uploading && (
                        <div
                            className={`absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 ${shapeClass}`}
                        >
                            <svg
                                className="w-7 h-7 text-blue-400 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                            <span className="text-xs text-blue-300 mt-2 font-medium">
                                Uploading…
                            </span>
                        </div>
                    )}

                    {/* Hover / empty overlay */}
                    {!uploading && (
                        <div
                            className={[
                                "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 z-10",
                                shapeClass,
                                displayUrl
                                    ? "opacity-0 group-hover:opacity-100 bg-black/55"
                                    : "opacity-100",
                            ].join(" ")}
                        >
                            {displayUrl ? (
                                <>
                                    {/* Camera — click zone to change image */}
                                    <Camera className="w-6 h-6 text-white drop-shadow" />

                                    {/* ── CIRCLE ONLY: trash button inside hover overlay ── */}
                                    {shape === "circle" && (
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-red-500/30 border border-red-400/40 text-red-300 hover:bg-red-500/60 hover:text-white transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-blue-400" />
                                    </div>
                                    {shape !== "circle" && (
                                        <>
                                            <p className="text-sm font-medium text-[#8888aa] group-hover:text-blue-300 transition-colors">
                                                {dragOver
                                                    ? "Drop it!"
                                                    : "Drop image or click to browse"}
                                            </p>
                                            <p className="text-xs text-[#555577]">
                                                PNG, JPG, WEBP · max {maxMB} MB
                                            </p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="sr-only"
                        onChange={onInputChange}
                        tabIndex={-1}
                    />
                </div>

                {/* ── SQUARE ONLY: X button lives OUTSIDE the overflow-hidden zone ── */}
                {shape !== "circle" && displayUrl && !uploading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-[#1a1a2e] border border-[#2a2a4a] text-[#8888aa] hover:bg-red-500/80 hover:border-red-500/50 hover:text-white flex items-center justify-center transition-all shadow-lg"
                        aria-label="Remove image"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Label */}
            {label && shape !== "circle" && (
                <p className="text-xs text-[#555577] text-center">{label}</p>
            )}

            {/* Error */}
            {displayError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3 flex-shrink-0" />
                    {displayError}
                </p>
            )}
        </div>
    );
}
