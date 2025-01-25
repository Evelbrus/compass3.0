import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient, UserRole, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CustomUser {
  id: string;
  uuid: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  gender?: Gender;
  address?: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends CustomUser {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        const customUser: CustomUser = {
          id: user.uuid,
          uuid: user.uuid,
          email: user.email,
          role: user.role as UserRole,
        };

        return customUser;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.uuid = customUser.uuid;
        token.email = customUser.email;
        token.role = customUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id || !token.uuid || !token.email || !token.role) {
        console.error('Missing token data:', token);
        throw new Error('Missing token data');
      }

      session.user = {
        id: token.id,
        uuid: token.uuid,
        email: token.email,
        role: token.role,
        fullName: token.fullName,
        phone: token.phone,
        gender: token.gender,
        address: token.address,
      } as CustomUser;
      return session;
    },
  },
};

export default NextAuth(authOptions);
