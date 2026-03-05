export type StaffSchedule = {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type StaffBlock = {
  id: string;
  staffId: string;
  startAt: string;
  endAt: string;
  reason: string;
};
