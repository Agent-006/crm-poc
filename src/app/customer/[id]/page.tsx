"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, DollarSign, Package, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  totalAmountSpent: number;
  dueAmount: number;
  advancedAmount: number;
  orders: string[];
  createdAt: string;
  updatedAt: string;
}

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

const Page = () => {
  const { id } = useParams();
  console.log("customer_id", id);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Get customer by id using get-customer API
        const customerResponse = await axios.post('/api/customer/get-customer-by-id', {
          id
        });
        const customerData = customerResponse.data.customer;
        console.log(customerData);
        setCustomer(customerData);

        // Get customer orders using their phone number
        const ordersResponse = await axios.post('/api/order/get-customer-order', {
          phone: customerData.phone
        });
        setOrders(ordersResponse.data.orders || []);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        toast.error('Failed to fetch customer data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[125px]" />
          <Skeleton className="h-[125px]" />
          <Skeleton className="h-[125px]" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Customer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                Customer since {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <Button>Edit Customer</Button>
      </div>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customer.totalAmountSpent || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(customer.dueAmount || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.length > 0 ? formatCurrency((customer.totalAmountSpent || 0) / orders.length) : formatCurrency(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Contact details and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {formatDate(customer.createdAt)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Spent:</span>
                <span className="font-medium">{formatCurrency(customer.totalAmountSpent || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Amount:</span>
                <span className="font-medium text-red-600">{formatCurrency(customer.dueAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Advanced Amount:</span>
                <span className="font-medium text-green-600">{formatCurrency(customer.advancedAmount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={order._id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Payment: {order.modeOfPayment}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                      {order.dueAmount > 0 && (
                        <p className="text-xs text-red-600">Due: {formatCurrency(order.dueAmount)}</p>
                      )}
                    </div>
                  </div>
                  {order.remarks && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Remarks: {order.remarks}
                      </p>
                    </div>
                  )}
                  {index < orders.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground">No orders found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
