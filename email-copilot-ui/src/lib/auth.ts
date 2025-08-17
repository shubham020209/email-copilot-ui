// src/lib/auth.ts
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration:
 * - Google provider with identity-only scopes (openid email profile)
 * - JWT sessions (default for App Router)
 * - Callbacks copy Google's access_token/scope into the session
 *   so server routes can talk to Google APIs later.
 */
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } }, // identity only for login
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account }) {
      // Runs when user logs in or re-consents (incremental auth).
      if (account) {
        token.accessToken = account.access_token; // bearer token from Google
        token.scope = account.scope;              // e.g., "openid email profile"
      }
      return token;
    },
    async session({ session, token }) {
      // Expose access token & scope to the session
      (session as any).accessToken = token.accessToken;
      (session as any).scope = token.scope;
      return session;
    },
  },
};
