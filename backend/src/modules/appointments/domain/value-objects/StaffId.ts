export class StaffId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('StaffId cannot be empty');
    }
  }

  toString() {
    return this.value;
  }
}
