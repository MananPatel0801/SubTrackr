
'use client';

import React, { type FC, useEffect, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Subscription, SubscriptionBillingCycle, SubscriptionCategory, SubscriptionStatus, PaymentCardType } from "@/types";
import { CATEGORIES, BILLING_CYCLES, STATUSES, CARD_TYPES } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  billingCycle: z.enum(BILLING_CYCLES),
  startDate: z.date({ required_error: "Start date is required." }),
  status: z.enum(STATUSES),
  notes: z.string().optional(),
  paymentCardType: z.enum([...CARD_TYPES, ""]).optional(), // Allow empty string for unselected
  paymentCardLastFour: z.string()
    .length(4, { message: "Must be 4 digits." })
    .regex(/^\d{4}$/, { message: "Must be 4 digits." })
    .optional()
    .or(z.literal("")), // Allow empty string
});

type FormData = z.infer<typeof formSchema>;

interface AddSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Subscription) => void;
  subscriptionToEdit?: Subscription | null;
}

const INTERNAL_NONE_CARD_TYPE_VALUE = "__NONE_CARD_TYPE__";

const AddSubscriptionForm: FC<AddSubscriptionFormProps> = ({ isOpen, onClose, onSubmit, subscriptionToEdit }) => {
  const { toast } = useToast();
  
  const defaultFormValues: FormData = useMemo(() => ({
    name: "",
    category: CATEGORIES[0],
    price: 0,
    billingCycle: BILLING_CYCLES[0],
    startDate: new Date(),
    status: STATUSES[0],
    notes: "",
    paymentCardType: "",
    paymentCardLastFour: "",
  }), []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: subscriptionToEdit ? {
      ...subscriptionToEdit,
      price: Number(subscriptionToEdit.price), // Ensure price is number
      startDate: new Date(subscriptionToEdit.startDate), // Ensure startDate is a Date object
      paymentCardType: subscriptionToEdit.paymentCardType || "",
      paymentCardLastFour: subscriptionToEdit.paymentCardLastFour || "",
    } : defaultFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      const resetValues = subscriptionToEdit ? {
        ...subscriptionToEdit,
        price: Number(subscriptionToEdit.price),
        startDate: new Date(subscriptionToEdit.startDate), // Ensure startDate is a Date object
        paymentCardType: subscriptionToEdit.paymentCardType || "",
        paymentCardLastFour: subscriptionToEdit.paymentCardLastFour || "",
      } : defaultFormValues;
      form.reset(resetValues);
    }
  }, [isOpen, subscriptionToEdit, form, defaultFormValues]);


  const handleSubmit = (data: FormData) => {
    const newSubscription: Subscription = {
      id: subscriptionToEdit ? subscriptionToEdit.id : crypto.randomUUID(),
      ...data,
      startDate: new Date(data.startDate), // Ensure startDate is a Date object when submitting
      paymentCardType: data.paymentCardType as PaymentCardType || undefined, // Ensure it's PaymentCardType or undefined
      paymentCardLastFour: data.paymentCardLastFour || undefined, // Ensure it's string or undefined
    };
    onSubmit(newSubscription);
    toast({
      title: subscriptionToEdit ? "Subscription Updated" : "Subscription Added",
      description: `${data.name} has been successfully ${subscriptionToEdit ? 'updated' : 'added'}.`,
      variant: "default",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subscriptionToEdit ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
          <DialogDescription>
            {subscriptionToEdit ? "Update the details of your subscription." : "Fill in the details of your new subscription."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Netflix Premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 19.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle} value={cycle} className="capitalize">{cycle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-1">Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentCardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Card Type (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === INTERNAL_NONE_CARD_TYPE_VALUE ? "" : value)} 
                      value={field.value === "" || field.value === undefined ? INTERNAL_NONE_CARD_TYPE_VALUE : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={INTERNAL_NONE_CARD_TYPE_VALUE}>None</SelectItem>
                        {CARD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentCardLastFour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Last 4 Digits (Optional)</FormLabel>
                    <FormControl>
                      <Input type="text" maxLength={4} placeholder="e.g. 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes about this subscription..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{subscriptionToEdit ? "Save Changes" : "Add Subscription"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriptionForm;
