export interface Alert {
  icon: string;
  message: string;
  ttl: number;
  type: 'success' | 'warning' | 'danger';
}
