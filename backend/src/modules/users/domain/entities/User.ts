import type { UserRole } from '../../../../shared/domain/roles';

type UserProps = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: string | null;
  tenantId: string | null;
  branchIds?: string[];
  createdAt: string;
};

export type UserRecord = UserProps;

export class User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: string | null;
  tenantId: string | null;
  branchIds: string[];
  createdAt: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.active = props.active;
    this.whatsappConsent = props.whatsappConsent;
    this.approved = props.approved;
    this.resetTokenHash = props.resetTokenHash ?? null;
    this.resetTokenExpiresAt = props.resetTokenExpiresAt ?? null;
    this.tenantId = props.tenantId;
    this.branchIds = props.branchIds ?? [];
    this.createdAt = props.createdAt;
  }
}
