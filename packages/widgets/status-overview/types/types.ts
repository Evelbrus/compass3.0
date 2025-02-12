export interface StatusItem {
  key: string;
  label: string;
  description: string;
  color: string;
}

export interface StatusOverviewProps<T = string> {
  selectedStatus: T | null;
  statusCounts: Record<string, number>;
  onSelectStatus: (status: T) => void;
  statusOverview: StatusItem[];
}
