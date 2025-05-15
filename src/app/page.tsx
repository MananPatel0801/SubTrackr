
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Subscription } from '@/types';
import { INITIAL_SUBSCRIPTIONS_DATA } from '@/lib/constants';
import DashboardHeader from './components/dashboard-header';
import AddSubscriptionForm from './components/add-subscription-form';
import SubscriptionTable from './components/subscription-table';
import ExpenseOverviewChart from './components/expense-overview-chart';
import SubscriptionFilters, { type Filters } from './components/subscription-filters';
import StatsOverview from './components/stats-overview';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { addMonths, addYears, format } from 'date-fns';

const defaultFilters: Filters = {
  category: 'all',
  status: 'all',
};

const calculateNextRenewalDateForExport = (subscription: Subscription): string => {
  if (subscription.status !== 'active' || subscription.billingCycle === 'one-time') {
    return 'N/A';
  }
  let renewalDate = new Date(subscription.startDate);
  const currentDate = new Date();
  if (subscription.billingCycle === 'monthly') {
    while (renewalDate <= currentDate) {
      renewalDate = addMonths(renewalDate, 1);
    }
  } else if (subscription.billingCycle === 'yearly') {
    while (renewalDate <= currentDate) {
      renewalDate = addYears(renewalDate, 1);
    }
  }
  return format(renewalDate, 'yyyy-MM-dd');
};


export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    return INITIAL_SUBSCRIPTIONS_DATA.map(sub => ({
      ...sub,
      startDate: new Date(sub.startDate) 
    }));
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subscriptionToDeleteId, setSubscriptionToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedSubs = localStorage.getItem('subtrackr-subscriptions');
    if (storedSubs) {
      try {
        const parsedSubs = JSON.parse(storedSubs).map((sub: any) => ({
          ...sub,
          startDate: new Date(sub.startDate) 
        }));
        setSubscriptions(parsedSubs);
      } catch (error) {
        console.error("Failed to parse subscriptions from localStorage", error);
        setSubscriptions(INITIAL_SUBSCRIPTIONS_DATA.map(sub => ({...sub, startDate: new Date(sub.startDate)})));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('subtrackr-subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const handleAddSubscription = () => {
    setSubscriptionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsFormOpen(true);
  };

  const handleDeleteSubscriptionPrompt = (subscriptionId: string) => {
    setSubscriptionToDeleteId(subscriptionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubscription = () => {
    if (subscriptionToDeleteId) {
      setSubscriptions(subs => subs.filter(sub => sub.id !== subscriptionToDeleteId));
      toast({ title: "Subscription Deleted", description: "The subscription has been removed.", variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
    setSubscriptionToDeleteId(null);
  };

  const handleFormSubmit = (data: Subscription) => {
    // Ensure startDate is a Date object
    const subscriptionData = {
      ...data,
      startDate: new Date(data.startDate)
    };

    if (subscriptionToEdit) {
      setSubscriptions(subs => subs.map(s => s.id === subscriptionData.id ? subscriptionData : s));
    } else {
      setSubscriptions(subs => [...subs, subscriptionData]);
    }
    setIsFormOpen(false);
    setSubscriptionToEdit(null);
  };

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const categoryMatch = filters.category === 'all' || sub.category === filters.category;
      const statusMatch = filters.status === 'all' || sub.status === filters.status;
      return categoryMatch && statusMatch;
    });
  }, [subscriptions, filters]);

  const handleExportData = () => {
    if (filteredSubscriptions.length === 0) {
      toast({ title: "No Data to Export", description: "There are no subscriptions matching current filters.", variant: "default" });
      return;
    }
    const headers = "ID,Name,Category,Price,Billing Cycle,Start Date,Status,Upcoming Renewal Date,Payment Card Type,Payment Card Last Four,Notes\n";
    const csvContent = filteredSubscriptions.map(sub => 
      [
        sub.id,
        `"${sub.name.replace(/"/g, '""')}"`,
        sub.category,
        sub.price,
        sub.billingCycle,
        format(new Date(sub.startDate), 'yyyy-MM-dd'),
        sub.status,
        calculateNextRenewalDateForExport(sub),
        sub.paymentCardType || '',
        sub.paymentCardLastFour || '',
        `"${(sub.notes || '').replace(/"/g, '""')}"`
      ].join(',')
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "subscriptions_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Data Exported", description: "Subscription data has been downloaded as CSV.", variant: "default" });
    } else {
       toast({ title: "Export Failed", description: "Your browser does not support this feature.", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow">
        <DashboardHeader onAddSubscription={handleAddSubscription} onExportData={handleExportData} />
        
        <StatsOverview subscriptions={filteredSubscriptions} />

        <SubscriptionFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onResetFilters={handleResetFilters}
        />
        
        <SubscriptionTable 
          subscriptions={filteredSubscriptions} 
          onEdit={handleEditSubscription} 
          onDelete={handleDeleteSubscriptionPrompt}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
          <div className="lg:col-span-3">
            <ExpenseOverviewChart subscriptions={filteredSubscriptions} />
          </div>
        </div>

      </div>

      <AddSubscriptionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        subscriptionToEdit={subscriptionToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubscriptionToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSubscription}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SubTrackr. All rights reserved.
      </footer>
    </div>
  );
}
