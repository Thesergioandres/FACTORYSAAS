export type CustomerProps = {
  id: string;
  tenantId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
  createdAt: string;
};

export type CustomerRecord = CustomerProps;

export class Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: string;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.email = props.email ?? null;
    this.phone = props.phone ?? null;
    this.notes = props.notes ?? null;
    this.tags = props.tags ?? [];
    this.createdAt = props.createdAt;
  }
}
