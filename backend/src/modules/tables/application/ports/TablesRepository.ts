export type TableStatus = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'LIMPIEZA';

export type TableRecord = {
  id: string;
  tenantId: string;
  name: string;
  capacity?: number;
  currentOrderId?: string;
  status: TableStatus;
  updatedAt: string;
};

export type CreateTableInput = {
  tenantId: string;
  name: string;
  capacity?: number;
};

export interface TablesRepository {
  list(tenantId: string): Promise<TableRecord[]>;
  create(input: CreateTableInput): Promise<TableRecord>;
  updateStatus(tenantId: string, id: string, status: TableStatus, currentOrderId?: string): Promise<TableRecord | null>;
}
