
'use client';

import type { FC } from 'react';
import { format, addMonths, addYears } from 'date-fns';
import { MoreHorizontal, Edit3, Trash2, PlayCircle, PauseCircle, XCircle, CalendarClock, CreditCard } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subscription, SubscriptionStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClientRenderedText from './client-rendered-text'; // Import the new component

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscriptionId: string) => void;
}

const StatusBadge: FC<{ status: SubscriptionStatus }> = ({ status }) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><PlayCircle className="mr-1 h-3 w-3" />Active</Badge>;
    case 'paused':
      return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900"><PauseCircle className="mr-1 h-3 w-3" />Paused</Badge>;
    case 'cancelled':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const calculateNextRenewalDate = (subscription: Subscription): string => {
  if (subscription.status !== 'active' || subscription.billingCycle === 'one-time') {
    return 'N/A';
  }

  let renewalDate = new Date(subscription.startDate); // startDate is already a Date object
  const currentDate = new Date(); // This will be evaluated on the client inside ClientRenderedText

  if (subscription.billingCycle === 'monthly') {
    while (renewalDate <= currentDate) {
      renewalDate = addMonths(renewalDate, 1);
    }
  } else if (subscription.billingCycle === 'yearly') {
    while (renewalDate <= currentDate) {
      renewalDate = addYears(renewalDate, 1);
    }
  }
  return format(renewalDate, 'MMM d, yyyy');
};

const SubscriptionTable: FC<SubscriptionTableProps> = ({ subscriptions, onEdit, onDelete }) => {
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>No subscriptions found. Add one to get started!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">You haven't added any subscriptions yet.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscriptions</CardTitle>
        <CardDescription>A list of all your tracked subscriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead><CalendarClock className="inline-block mr-1 h-4 w-4" />Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><CreditCard className="inline-block mr-1 h-4 w-4" />Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.category}</TableCell>
                  <TableCell className="text-right">
                    ${sub.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                  <TableCell>
                    <ClientRenderedText placeholder="Loading date...">
                      {format(new Date(sub.startDate), 'MMM d, yyyy')}
                    </ClientRenderedText>
                  </TableCell>
                  <TableCell>
                    <ClientRenderedText placeholder="Calculating...">
                      {calculateNextRenewalDate(sub)}
                    </ClientRenderedText>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>
                    {sub.paymentCardType && sub.paymentCardLastFour 
                      ? `${sub.paymentCardType} ****${sub.paymentCardLastFour}`
                      : sub.paymentCardType 
                        ? sub.paymentCardType
                        : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(sub)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(sub.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionTable;
