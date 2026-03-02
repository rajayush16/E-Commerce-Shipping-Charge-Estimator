"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { estimateShipping } from "@/lib/shipping";

const shippingSchema = z.object({
  weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
  distance: z.number().min(1, "Distance must be at least 1 km"),
  service: z.enum(["standard", "express"]),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export function ShippingEstimatorForm() {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      weight: 1,
      distance: 10,
      service: "standard",
    },
  });

  const mutation = useMutation({
    mutationFn: estimateShipping,
  });

  const onSubmit = (values: ShippingFormData) => {
    mutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-xl shadow-sm">
      <CardHeader>
        <CardTitle>Shipping Charge Estimator</CardTitle>
        <CardDescription>Starter form with React Hook Form, Zod, and TanStack Query.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                      {...field}
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Estimating..." : "Estimate Shipping"}
            </Button>
          </form>
        </Form>

        {mutation.data ? (
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">
              Estimated charge: {mutation.data.currency} {mutation.data.shippingCharge}
            </p>
            <p className="text-muted-foreground">Expected delivery in {mutation.data.etaDays} days.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
