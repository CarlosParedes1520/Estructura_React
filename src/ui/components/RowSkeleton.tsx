import * as React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface ReusableRowSkeletonProps {
  colWidths: string[];
}

export const ReusableRowSkeleton: React.FC<ReusableRowSkeletonProps> = ({
  colWidths,
}) => {
  return (
    <TableRow className="block border-b sm:table-row mb-4 sm:mb-0">
      {colWidths.map((widthClass, index) => (
        <TableCell key={index} className="block p-4 sm:table-cell sm:p-2">
          {/* Usamos el widthClass que llega por props */}
          <div
            className={`h-4 ${widthClass} animate-pulse rounded bg-slate-200`}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};
