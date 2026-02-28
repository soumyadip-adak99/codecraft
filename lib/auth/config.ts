import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

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
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              name: user.name || "User",
              image: user.image,
              lastLogin: new Date(),
            },
            $setOnInsert: {
              email: user.email,
              stats: {
                totalSolved: 0,
                totalAttempted: 0,
                currentStreak: 0,
                longestStreak: 0,
                averageExecutionTime: 0,
                accuracy: 0,
              },
            },
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("SignIn error:", error);
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
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

      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.stats = dbUser.stats;
          session.user.hasApiKey = !!dbUser.llmApiKey;
        }
      } catch (error) {
        console.error("Session error:", error);
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
