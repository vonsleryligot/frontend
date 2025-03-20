import { createContext, useContext, useState } from "react";

interface Shift {
  id: number;
  date: string;
  time: string;
  timeIn?: string;
  timeOut?: string;
  totalHours?: string;
  shifts?: string;
  status?: "Pending" | "In Progress" | "Completed";
}

interface ShiftContextType {
  shifts: Shift[];
  timeIn: (shiftId: number, time: string) => void;
  timeOut: (shiftId: number, time: string) => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [shifts, setShifts] = useState<Shift[]>([
  ]);

  const timeIn = (shiftId: number, time: string) => {
    setShifts(shifts.map(shift => 
      shift.id === shiftId ? { ...shift, timeIn: time, status: "In Progress" } : shift
    ));
  };
  

  const timeOut = (shiftId: number, time: string) => {
    setShifts(shifts.map(shift => {
      if (shift.id === shiftId && shift.timeIn) {
        const timeInDate = new Date(`2025-03-15T${shift.timeIn}`);
        const timeOutDate = new Date(`2025-03-15T${time}`);
        const totalHours = ((timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60)).toFixed(2);

        return { ...shift, timeOut: time, totalHours, status: "Completed" };
      }
      return shift;
    }));
  };

  return (
    <ShiftContext.Provider value={{ shifts, timeIn, timeOut }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error("useShiftContext must be used within a ShiftProvider");
  }
  return context;
};
