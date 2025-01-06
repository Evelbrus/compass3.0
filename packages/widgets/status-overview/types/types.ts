export interface StatusItem {
  key: string;
  label: string;
  description: string;
  color: string;
}

export interface StatusOverviewProps {
  selectedStatus: string | null;
  statusCounts: Record<string, number>;
  onSelectStatus: (status: string) => void;
  statusOverview: StatusItem[];
}
