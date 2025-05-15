import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Layers } from "lucide-react";

interface DashboardHeaderProps {
  onAddSubscription: () => void;
  onExportData: () => void;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ onAddSubscription, onExportData }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b">
      <div className="flex items-center mb-4 sm:mb-0">
        <Layers className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">SubTrackr</h1>
      </div>
      <div className="flex space-x-3">
        <Button onClick={onAddSubscription} variant="default">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Subscription
        </Button>
        <Button onClick={onExportData} variant="outline">
          <Download className="mr-2 h-5 w-5" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
