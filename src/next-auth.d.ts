
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string | null;
      organizationId?: string | null;
      selectedOrganizationId?: string | null;
    };
  }

  interface User {
    role?: string | null;
    organizationId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string | null;
    organizationId?: string | null;
    selectedOrganizationId?: string | null;
  }
}
