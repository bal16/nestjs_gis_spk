import type { InvitationToken } from '../../generated/prisma/client';

export class InvitationTokenEntity implements InvitationToken {
  id: string;
  token: string;
  email: string | null;
  role: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
