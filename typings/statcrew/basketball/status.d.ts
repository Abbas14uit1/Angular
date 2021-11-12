export interface IStatus {
  complete: 'Y' | 'N';
  period: number;
  clock: string;
  running: string;
}