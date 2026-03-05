import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { PlansRepository, PlanEntity, CreatePlanInput, UpdatePlanInput } from '../../application/ports/PlansRepository';

function mapPlan(plan: PlanEntity): PlanEntity {
  return { ...plan, features: [...plan.features] };
}

export class InMemoryPlansRepository implements PlansRepository {
  async findById(id: string) {
    const plan = database.plans.find((item) => item.id === id);
    return plan ? mapPlan(plan) : null;
  }

  async findByName(name: string) {
    const plan = database.plans.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return plan ? mapPlan(plan) : null;
  }

  async listAll() {
    return database.plans.map(mapPlan);
  }

  async create(input: CreatePlanInput) {
    const plan: PlanEntity = { id: randomUUID(), ...input };
    database.plans.push(plan);
    return mapPlan(plan);
  }

  async update(id: string, input: UpdatePlanInput) {
    const plan = database.plans.find((item) => item.id === id);
    if (!plan) return null;

    if (input.price !== undefined) plan.price = input.price;
    if (input.maxBranches !== undefined) plan.maxBranches = input.maxBranches;
    if (input.maxStaff !== undefined) plan.maxStaff = input.maxStaff;
    if (input.maxMonthlyAppointments !== undefined) plan.maxMonthlyAppointments = input.maxMonthlyAppointments;
    if (input.features !== undefined) plan.features = [...input.features];

    return mapPlan(plan);
  }
}
