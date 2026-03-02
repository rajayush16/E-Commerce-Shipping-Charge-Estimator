"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, type DeliverySpeed, type TransportMode } from "@/lib/api";

type HistoryItem = {
  id: string;
  deliverySpeed: DeliverySpeed;
  transportMode: TransportMode;
  totalRs: number;
  createdAt: string;
  seller: { name: string };
  customer: { name: string };
  product: { name: string };
};

export default function HistoryPage() {
  const [speed, setSpeed] = useState("");
  const [mode, setMode] = useState("");

  const query = useQuery({
    queryKey: ["shipping-history", speed, mode],
    queryFn: () => api.getHistory(speed as DeliverySpeed, mode as TransportMode),
  });

  const rows = (query.data ?? []) as HistoryItem[];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Recent calculations</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Filter speed (standard/express)"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
            <Input
              placeholder="Filter mode (MINI_VAN/TRUCK/AEROPLANE)"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{row.seller.name}</TableCell>
                    <TableCell>{row.customer.name}</TableCell>
                    <TableCell>{row.product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.deliverySpeed}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{row.transportMode}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹ {row.totalRs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
