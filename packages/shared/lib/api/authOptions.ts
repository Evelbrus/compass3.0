import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';

declare module 'next-auth' {
  interface User {
    uuid: string;
    role: UserRole;
    email: string;
  }

  interface Session {
    user: {
      uuid: string;
      email: string;
      role: UserRole;
    };
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uuid: string;
    role: UserRole;
    email: string;
  }
}

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '300', 10);

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
          throw new Error('Некорректные учетные данные');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              uuid: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user) {
            throw new Error('Пользователь не найден');
          }

          if (!(await bcrypt.compare(credentials.password, user.password))) {
            throw new Error('Неверный пароль');
          }

          return {
            id: user.uuid,
            uuid: user.uuid,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Ошибка аутентификации');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_DURATION,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_DURATION,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          uuid: user.uuid,
          email: user.email,
          role: user.role,
        };
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          uuid: token.uuid,
          email: token.email,
          role: token.role,
        },
        expires: new Date(Date.now() + SESSION_DURATION * 1000).toISOString(),
      };
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
