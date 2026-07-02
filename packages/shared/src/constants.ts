export const DEPARTMENTS = [
  'Grocery',
  'Agriculture',
  'Building Materials',
  'Hardware Tools',
  'Plumbing',
  'Electrical',
  'Furniture',
  'Home Appliances',
  'Electronics',
  'General Store'
] as const;

export type Department = typeof DEPARTMENTS[number];
