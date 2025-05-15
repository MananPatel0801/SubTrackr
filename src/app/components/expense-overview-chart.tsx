'use client';

import type { FC } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Subscription } from '@/types';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ExpenseOverviewChartProps {
  subscriptions: Subscription[];
}

const ExpenseOverviewChart: FC<ExpenseOverviewChartProps> = ({ subscriptions }) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const dataByCategory = activeSubscriptions.reduce((acc, sub) => {
    const category = sub.category;
    let monthlyPrice = sub.price;
    if (sub.billingCycle === 'yearly') {
      monthlyPrice = sub.price / 12;
    } else if (sub.billingCycle === 'one-time') {
      // Assuming one-time purchases are spread over a year for this visualization, or excluded.
      // For simplicity, let's assume they are not part of recurring monthly costs here.
      // Or assign to a very long period if it makes sense for the context.
      // Let's make them contribute 1/12th for a year as an example, then zero.
      // This part might need more sophisticated handling based on requirements.
      // For now, we'll include them as a one-time hit in their start month or average them.
      // Let's just take their full price for the category sum for simplicity in this chart.
      monthlyPrice = sub.price; // Or handle based on specific logic
    }

    if (!acc[category]) {
      acc[category] = { name: category, totalCost: 0 };
    }
    acc[category].totalCost += monthlyPrice;
    return acc;
  }, {} as Record<string, { name: string; totalCost: number }>);

  const chartData = Object.values(dataByCategory).map(item => ({
    ...item,
    totalCost: parseFloat(item.totalCost.toFixed(2)) // Ensure two decimal places
  })).sort((a, b) => b.totalCost - a.totalCost);

  const chartConfig = {
    totalCost: {
      label: "Total Cost",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  if (activeSubscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Overview</CardTitle>
          <CardDescription>Monthly cost breakdown by category.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">No active subscriptions to display in chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Overview</CardTitle>
        <CardDescription>Estimated monthly cost breakdown by category for active subscriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-video">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <Tooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={{ fill: "hsl(var(--accent) / 0.2)" }}
              />
              <Legend />
              <Bar dataKey="totalCost" fill="var(--color-totalCost)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExpenseOverviewChart;
