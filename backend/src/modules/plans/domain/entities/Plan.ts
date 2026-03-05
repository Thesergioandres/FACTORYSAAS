type PlanProps = {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  maxMonthlyAppointments: number;
  features: string[];
  createdAt: string;
};

export type PlanRecord = PlanProps;

export class Plan {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  maxMonthlyAppointments: number;
  features: string[];
  createdAt: string;

  constructor(props: PlanProps) {
    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.maxBranches = props.maxBranches;
    this.maxStaff = props.maxStaff;
    this.maxMonthlyAppointments = props.maxMonthlyAppointments;
    this.features = props.features;
    this.createdAt = props.createdAt;
  }
}
