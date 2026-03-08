import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { getConvexClient } from "@/lib/db/convex";
import { api } from "../../convex/_generated/api";
import { EmailService } from "@/lib/email/service";

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
                // Upsert user in MongoDB — the raw result tells us if this was an INSERT (new user)
                await connectDB();
                const result = await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        $set: { image: user.image },
                        $setOnInsert: { email: user.email },
                    },
                    { upsert: true, new: true, includeResultMetadata: true }
                );

                // `updatedExisting: false` means the document was just inserted → new user
                const isNewUser = result?.lastErrorObject?.updatedExisting === false;

                if (isNewUser) {
                    // Increment platform stats via Convex (keep existing behaviour)
                    const convex = getConvexClient();
                    await convex.mutation(api.platformStats.increment, {
                        totalDevelopers: 1,
                    });

                    // Fire welcome email asynchronously — never blocks sign-in
                    const firstName = (user.name ?? user.email?.split("@")[0] ?? "Coder");
                    new EmailService()
                        .sendWelcomeEmail(user.email, firstName)
                        .catch((err) =>
                            console.error("[Welcome Email] Failed to send:", err)
                        );
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
