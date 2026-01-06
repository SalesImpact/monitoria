
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-utils';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
          include: { organization: true },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        // Não definir selectedOrganizationId automaticamente para admins
        if (user.role !== 'admin') {
          token.selectedOrganizationId = user.organizationId;
        }
      }

      if (trigger === 'update' && session?.selectedOrganizationId) {
        token.selectedOrganizationId = session.selectedOrganizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.selectedOrganizationId = token.selectedOrganizationId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
  },
};
