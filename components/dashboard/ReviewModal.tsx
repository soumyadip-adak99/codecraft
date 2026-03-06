"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { Loader2, Send, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    userImageUrl?: string | null;
}

export function ReviewModal({
    isOpen,
    onClose,
    userName,
    userEmail,
    userImageUrl,
}: ReviewModalProps) {
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const addReview = useMutation(api.reviews.addReview);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Focus textarea when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 80);
        } else {
            setReviewText("");
            setRating(0);
            setHoveredStar(0);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!userEmail || !userName) {
            toast.error("Please log in to submit a review");
            return;
        }
        if (reviewText.trim().length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }
        setSubmitting(true);
        try {
            await addReview({
                reviewText: reviewText.trim(),
                userName,
                userEmail,
                userImageUrl: userImageUrl || undefined,
            });
            toast.success("Review submitted! Thank you 🎉");
            onClose();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const displayStars = hoveredStar || rating;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
            style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
        >
            <div
                className="w-full max-w-lg rounded-2xl border border-orange-500/20 bg-[#0e0e0e] shadow-2xl shadow-orange-500/10 animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-label="Write a Review"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                            Write a Review
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Share your CodeCraft experience</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Star rating */}
                    <div>
                        <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Your Rating</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                                    aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                                >
                                    <Star
                                        className={`h-7 w-7 transition-colors ${star <= displayStars
                                                ? "text-orange-400 fill-orange-400"
                                                : "text-zinc-700 fill-transparent"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div>
                        <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Your Review</p>
                        <textarea
                            ref={textareaRef}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="I really enjoyed using CodeCraft because..."
                            maxLength={500}
                            rows={4}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none transition-colors"
                        />
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[11px] text-zinc-600">
                                {reviewText.trim().length < 10 && reviewText.length > 0 && (
                                    <span className="text-red-400">{10 - reviewText.trim().length} more characters needed</span>
                                )}
                            </span>
                            <span className="text-[11px] text-zinc-600">{reviewText.length}/500</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 pb-6">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white cursor-pointer"
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || reviewText.trim().length < 10}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-400 text-white gap-2 disabled:opacity-50 cursor-pointer min-w-[130px]"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Submit Review
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
