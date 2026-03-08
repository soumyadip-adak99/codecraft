import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import Review from "@/models/Review";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        // 3 random reviews on every call
        const reviews = await Review.aggregate([
            { $sample: { size: 3 } },
            { $project: { _id: 1, userName: 1, review: 1, createdAt: 1 } },
        ]);
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Reviews fetch error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { review } = await req.json();

        if (!review || review.trim().length < 10) {
            return NextResponse.json(
                { error: "Review must be at least 10 characters long." },
                { status: 400 }
            );
        }
        if (review.trim().length > 500) {
            return NextResponse.json(
                { error: "Review must be 500 characters or less." },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email }).select("_id").lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newReview = await Review.create({
            userId: (user as { _id: unknown })._id,
            userName: session.user.name || "Anonymous",
            review: review.trim(),
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Review create error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
