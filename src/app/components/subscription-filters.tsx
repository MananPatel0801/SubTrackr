'use client';

import type { FC } from 'react';
import { Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubscriptionCategory, SubscriptionStatus } from '@/types';
import { CATEGORIES, STATUSES } from '@/lib/constants';

export interface Filters {
  category: SubscriptionCategory | 'all';
  status: SubscriptionStatus | 'all';
  // Future: nameSearch: string;
  // Future: priceRange: [number, number];
}

interface SubscriptionFiltersProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  onResetFilters: () => void;
}

const SubscriptionFilters: FC<SubscriptionFiltersProps> = ({ filters, onFilterChange, onResetFilters }) => {
  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value as Filters['category'] });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as Filters['status'] });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filter Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">
              Category
            </label>
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((stat) => (
                  <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={onResetFilters} variant="outline" className="w-full sm:w-auto">
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionFilters;
