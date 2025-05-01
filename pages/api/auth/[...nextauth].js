import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import { getUserTwoFactorSettings } from '../../../lib/2fa';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Find user by email
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Check password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);

          if (!passwordMatch) {
            return null;
          }

          // Check if 2FA is enabled
          const twoFactorSettings = await getUserTwoFactorSettings(user.id);

          if (twoFactorSettings?.enabled) {
            // Return user with requiresTwoFactor flag
            return {
              id: user.id,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
              email: user.email,
              image: user.image,
              requiresTwoFactor: true,
              twoFactorMethods: {
                email_enabled: twoFactorSettings.email_enabled,
                sms_enabled: twoFactorSettings.sms_enabled,
                duo_enabled: twoFactorSettings.duo_enabled,
                preferred_method: twoFactorSettings.preferred_method
              }
            };
          }

          // Return user object without password
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            email: user.email,
            image: user.image
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
    // 2FA completion provider
    CredentialsProvider({
      id: '2fa-completion',
      name: '2FA Completion',
      credentials: {
        userId: { label: "User ID", type: "text" },
        twoFactorVerified: { label: "2FA Verified", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials.userId || credentials.twoFactorVerified !== 'true') {
            return null;
          }

          // Get user by ID
          const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [credentials.userId]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Return user object
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            email: user.email,
            image: user.image
          };
        } catch (error) {
          console.error('2FA completion error:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        // Handle 2FA
        if (user.requiresTwoFactor) {
          token.requiresTwoFactor = true;
          token.twoFactorMethods = user.twoFactorMethods;
        }

        // If using the 2FA completion provider, clear the requiresTwoFactor flag
        if (account?.provider === '2fa-completion') {
          token.requiresTwoFactor = false;
          token.twoFactorMethods = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;

      // Add 2FA status to session
      if (token.requiresTwoFactor) {
        session.requiresTwoFactor = true;
        session.twoFactorMethods = token.twoFactorMethods;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle 2FA redirect
      if (url.startsWith(`${baseUrl}/auth/2fa`)) {
        return url;
      }

      // Default behavior
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  },
  adapter: {
    async createUser(user) {
      const { name, email, image } = user;

      // Split name into first_name and last_name if provided
      let firstName = '';
      let lastName = '';

      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      const result = await query(
        'INSERT INTO users (first_name, last_name, email, image) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, image',
        [firstName, lastName, email, image]
      );

      const newUser = result.rows[0];
      return {
        ...newUser,
        name: `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim() || email.split('@')[0]
      };
    },
    async getUser(id) {
      const result = await query(
        'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1',
        [id]
      );

      if (!result.rows[0]) return null;

      const user = result.rows[0];
      return {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
      };
    },
    async getUserByEmail(email) {
      const result = await query(
        'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE email = $1',
        [email]
      );

      if (!result.rows[0]) return null;

      const user = result.rows[0];
      return {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
      };
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const result = await query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.email_verified, u.image
         FROM users u
         JOIN accounts a ON u.id = a.user_id
         WHERE a.provider_id = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      );

      if (!result.rows[0]) return null;

      const user = result.rows[0];
      return {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
      };
    },
    async updateUser(user) {
      const { id, name, email, image } = user;

      // Split name into first_name and last_name if provided
      let firstName = '';
      let lastName = '';

      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      const result = await query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, image = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, first_name, last_name, email, image',
        [firstName, lastName, email, image, id]
      );

      const updatedUser = result.rows[0];
      return {
        ...updatedUser,
        name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || email.split('@')[0]
      };
    },
    async linkAccount(account) {
      const { userId, provider, type, providerAccountId, access_token, refresh_token, expires_at } = account;

      await query(
        `INSERT INTO accounts (user_id, provider_type, provider_id, provider_account_id, access_token, refresh_token, access_token_expires)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, type, provider, providerAccountId, access_token, refresh_token, expires_at ? new Date(expires_at * 1000) : null]
      );

      return account;
    },
    async createSession(session) {
      await query(
        'INSERT INTO sessions (user_id, expires, session_token, access_token) VALUES ($1, $2, $3, $4)',
        [session.userId, session.expires, session.sessionToken, session.accessToken]
      );

      return session;
    },
    async getSessionAndUser(sessionToken) {
      const sessionResult = await query(
        'SELECT * FROM sessions WHERE session_token = $1',
        [sessionToken]
      );

      const session = sessionResult.rows[0];

      if (!session) {
        return null;
      }

      const userResult = await query(
        'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1',
        [session.user_id]
      );

      const userData = userResult.rows[0];

      if (!userData) return null;

      const user = {
        ...userData,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email.split('@')[0]
      };

      return {
        session,
        user
      };
    },
    async updateSession(session) {
      const { sessionToken, expires, userId } = session;

      await query(
        'UPDATE sessions SET expires = $1, user_id = $2 WHERE session_token = $3',
        [expires, userId, sessionToken]
      );

      return session;
    },
    async deleteSession(sessionToken) {
      await query(
        'DELETE FROM sessions WHERE session_token = $1',
        [sessionToken]
      );
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
});
