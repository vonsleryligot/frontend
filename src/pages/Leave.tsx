
export interface Leave {
    id: number;
    userId: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: "Pending" | "Approved" | "Rejected";
    reason: string;
    createdAt: string;
  }
  