"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Calendar, User, Package } from "lucide-react";
import { toast } from "sonner";

interface Order {
  _id: string;
  status: string;
  remarks?: string;
  paidAmount: number;
  dueAmount: number;
  totalAmount: number;
  modeOfPayment: string;
  discount: number;
  customer: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "delivered":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const Page = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/order/get-order-by-id`, {
          params: { id },
        });
        setOrder(res.data.order);
      } catch (error: any) {
        toast.error("Failed to fetch order");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Order #{order._id.slice(-6)}
            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>{order.status}</Badge>
          </CardTitle>
          <CardDescription>
            Placed on {formatDate(order.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Customer: {order.customer}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Updated: {formatDate(order.updatedAt)}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Amount:</span>
              </div>
              <div>{formatCurrency(order.totalAmount)}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Paid Amount:</span>
              </div>
              <div>{formatCurrency(order.paidAmount)}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="font-medium">Due Amount:</span>
              </div>
              <div>{formatCurrency(order.dueAmount)}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Discount:</span>
              </div>
              <div>{formatCurrency(order.discount)}</div>
            </div>
          </div>
          <Separator />
          <div>
            <span className="font-medium">Payment Mode:</span> {order.modeOfPayment}
          </div>
          {order.remarks && (
            <div>
              <span className="font-medium">Remarks:</span> {order.remarks}
            </div>
          )}
          <Separator />
          <div>
            <span className="font-medium">Items:</span>
            <ul className="list-disc ml-6 mt-2">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">{item}</li>
                ))
              ) : (
                <li className="text-muted-foreground">No items found</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

