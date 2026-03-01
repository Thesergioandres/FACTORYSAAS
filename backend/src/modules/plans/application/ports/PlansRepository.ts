export type PlanEntity = {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxBarbers: number;
  maxMonthlyAppointments: number;
  features: string[];
};

export type CreatePlanInput = Omit<PlanEntity, 'id'>;

export type UpdatePlanInput = Partial<Omit<PlanEntity, 'id' | 'name'>>;

export interface PlansRepository {
  findById(id: string): Promise<PlanEntity | null>;
  findByName(name: string): Promise<PlanEntity | null>;
  listAll(): Promise<PlanEntity[]>;
  create(input: CreatePlanInput): Promise<PlanEntity>;
  update(id: string, input: UpdatePlanInput): Promise<PlanEntity | null>;
}
