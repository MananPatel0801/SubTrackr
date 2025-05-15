'use client';

import type { FC } from 'react';
import { DollarSign, Hash, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Subscription } from '@/types';

interface StatsOverviewProps {
  subscriptions: Subscription[];
}

const StatsOverview: FC<StatsOverviewProps> = ({ subscriptions }) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptionsCount = activeSubscriptions.length;

  const totalMonthlyCost = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') {
      return sum + sub.price;
    }
    if (sub.billingCycle === 'yearly') {
      return sum + sub.price / 12;
    }
    // One-time costs are not typically included in recurring monthly cost overviews
    // or handled differently depending on accounting. Here, we exclude them from this specific metric.
    return sum;
  }, 0);

  const totalYearlyCost = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') {
      return sum + sub.price * 12;
    }
    if (sub.billingCycle === 'yearly') {
      return sum + sub.price;
    }
    return sum;
  }, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground">{activeSubscriptionsCount} active</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on active subscriptions</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Yearly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalYearlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on active subscriptions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Frequent Category</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {
            (() => {
              if (activeSubscriptions.length === 0) return <div className="text-2xl font-bold">-</div>;
              const categoryCounts = activeSubscriptions.reduce((acc, sub) => {
                acc[sub.category] = (acc[sub.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const mostFrequent = Object.entries(categoryCounts).sort(([,a],[,b]) => b-a)[0];
              return (
                <>
                  <div className="text-2xl font-bold">{mostFrequent ? mostFrequent[0] : '-'}</div>
                  <p className="text-xs text-muted-foreground">{mostFrequent ? `${mostFrequent[1]} subscriptions` : ''}</p>
                </>
              );
            })()
          }
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
