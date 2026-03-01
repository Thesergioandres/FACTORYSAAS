import type { UserRole } from '../../../../shared/domain/roles';

type UserProps = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  whatsappConsent: boolean;
  passwordHash: string;
  approved: boolean;
  tenantId?: string | null;
};

export class User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  whatsappConsent: boolean;
  passwordHash: string;
  approved: boolean;
  tenantId: string | null;

  constructor({ id, name, email, phone, role, whatsappConsent, passwordHash, approved, tenantId }: UserProps) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.whatsappConsent = whatsappConsent;
    this.passwordHash = passwordHash;
    this.approved = approved;
    this.tenantId = tenantId ?? null;
  }
}
