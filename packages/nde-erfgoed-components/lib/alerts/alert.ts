export interface Alert {
  message: string;
  ttl: number;
  type: 'success' | 'warning' | 'danger';
}
