"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { EntityCombobox } from "@/components/entity-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type CalculationResponse, type DeliverySpeed } from "@/lib/api";

const schema = z.object({
  sellerId: z.string().uuid("Select a seller"),
  productId: z.string().uuid("Select a product"),
  customerId: z.string().uuid("Select a customer"),
  deliverySpeed: z.enum(["standard", "express"]),
});

type FormData = z.infer<typeof schema>;

function formatRs(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

export function CalculatorPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { deliverySpeed: "standard" },
  });

  const selectedSeller = useWatch({ control: form.control, name: "sellerId" });

  const sellersQuery = useQuery({
    queryKey: ["sellers", "list"],
    queryFn: () => api.getSellers(),
  });
  const customersQuery = useQuery({
    queryKey: ["customers", "list"],
    queryFn: () => api.getCustomers(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "seller", selectedSeller],
    queryFn: () => api.getProductsBySeller(selectedSeller),
    enabled: Boolean(selectedSeller),
  });

  const calculateMutation = useMutation({
    mutationFn: api.calculateShipping,
    onError: (error) => {
      const err = error as { message?: string };
      toast.error(err.message ?? "Failed to calculate shipping");
    },
  });

  const sellerOptions = useMemo(
    () => (sellersQuery.data?.items ?? []).map((seller) => ({ value: seller.id, label: seller.name })),
    [sellersQuery.data?.items]
  );
  const customerOptions = useMemo(
    () => (customersQuery.data?.items ?? []).map((customer) => ({ value: customer.id, label: customer.name })),
    [customersQuery.data?.items]
  );
  const productOptions = useMemo(
    () => (productsQuery.data ?? []).map((product) => ({ value: product.id, label: `${product.name} (${product.weightKg} kg)` })),
    [productsQuery.data]
  );

  const onSubmit = (values: FormData) => {
    calculateMutation.mutate({
      sellerId: values.sellerId,
      productId: values.productId,
      customerId: values.customerId,
      deliverySpeed: values.deliverySpeed as DeliverySpeed,
    });
  };

  const result = calculateMutation.data;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Estimate shipping by seller, product, customer, and speed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="sellerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller</FormLabel>
                      <FormControl>
                        {sellersQuery.isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <EntityCombobox
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              form.setValue("productId", undefined as unknown as string);
                            }}
                            options={sellerOptions}
                            placeholder="Select seller"
                            emptyText="No sellers found"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <FormControl>
                        {productsQuery.isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <EntityCombobox
                            value={field.value}
                            onChange={field.onChange}
                            options={productOptions}
                            placeholder={selectedSeller ? "Select product" : "Select seller first"}
                            emptyText="No products found"
                            disabled={!selectedSeller}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        {customersQuery.isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <EntityCombobox
                            value={field.value}
                            onChange={field.onChange}
                            options={customerOptions}
                            placeholder="Select customer"
                            emptyText="No customers found"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverySpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery speed</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 gap-3"
                        >
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <span>Standard</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="express" id="express" />
                            <span>Express</span>
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={!form.formState.isValid || calculateMutation.isPending}>
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating
                    </>
                  ) : (
                    "Calculate"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Shipping price and route details.</CardDescription>
          </CardHeader>
          <CardContent>
            {calculateMutation.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : result ? (
              <ResultPanel result={result} />
            ) : (
              <p className="text-sm text-muted-foreground">Fill the form and click Calculate.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ResultPanel({ result }: { result: CalculationResponse }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">Total shipping</p>
        <p className="text-3xl font-semibold tracking-tight">{formatRs(result.shippingCharge)}</p>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Nearest warehouse</span>
          <span>{result.nearestWarehouse.warehouseId.slice(0, 8)}...</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Seller → warehouse</span>
          <span>{result.sellerToWarehouseKm} km</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Warehouse → customer</span>
          <span>{result.warehouseToCustomerKm} km</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Transport mode</span>
          <Badge variant="secondary">{result.transportMode}</Badge>
        </div>
      </div>

      <Separator />

      <details className="group rounded-md border p-3">
        <summary className="cursor-pointer text-sm font-medium">Price breakdown</summary>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Base shipping</span>
            <span>{formatRs(result.breakdown.baseShipping)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Courier charge</span>
            <span>{formatRs(result.breakdown.courier)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Express extra</span>
            <span>{formatRs(result.breakdown.expressExtra)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
