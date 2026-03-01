import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { getConvexClient } from "@/lib/db/convex";
import { api } from "../../convex/_generated/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user?.email) return false;
            try {
                // Upsert minimal user in MongoDB (email + image only)
                await connectDB();
                await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        $set: { image: user.image },
                        $setOnInsert: { email: user.email },
                    },
                    { upsert: true, new: true }
                );

                // Ensure Convex userStatus row exists + increment developer count on first visit
                const convex = getConvexClient();
                const isNewUser = await convex.mutation(api.userStatus.ensureUser, {
                    email: user.email,
                });
                
                if (isNewUser) {
                    // Increment total developers (idempotent counting per sign-up handled by ensureUser)
                    await convex.mutation(api.platformStats.increment, {
                        totalDevelopers: 1,
                    });
                }
            } catch (error) {
                console.error("SignIn error:", error);
            }
            return true;
        },

        async jwt({ token, user, account }) {
            // On first sign-in, `user` is populated — forward image to JWT
            if (user) {
                token.userId = user.id;
                token.email = user.email;
                token.image = user.image ?? null;
            }
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },

        async session({ session, token }: any) {
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            if (token.email) {
                session.user.email = token.email as string;
            }
            // Restore image from JWT — this is the profile image fix
            if (token.image) {
                session.user.image = token.image as string;
            }

            // Fallback: if JWT didn't preserve image, check MongoDB
            if (!session.user.image) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({
                        email: session.user.email,
                    })
                        .select("image llmApiKey")
                        .lean();
                    if (dbUser) {
                        if ((dbUser as any).image) {
                            session.user.image = (dbUser as any).image;
                        }
                        session.user.hasApiKey = !!(dbUser as any).llmApiKey;
                    }
                } catch (error) {
                    console.error("Session callback error:", error);
                }
            } else {
                // Still need hasApiKey check
                try {
                    await connectDB();
                    const dbUser = await User.findOne({
                        email: session.user.email,
                    })
                        .select("llmApiKey")
                        .lean();
                    if (dbUser) {
                        session.user.hasApiKey = !!(dbUser as any).llmApiKey;
                    }
                } catch (error) {
                    console.error("Session callback error:", error);
                }
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
});
