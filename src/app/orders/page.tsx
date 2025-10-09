"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Plus,
    Loader2,
    ShoppingCart,
    Calendar,
    DollarSign,
    Eye,
    User,
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
    _id: string;
    customer:
        | {
              _id: string;
              name: string;
              phone: string;
              email?: string;
          }
        | string;
    status: string;
    totalAmount: number;
    discount: number;
    remarks: string;
    paidAmount: number;
    dueAmount: number;
    modeOfPayment: string;
    items: string[];
    createdAt: string;
    updatedAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/order/get-all-orders");
            const data = await response.json();

            if (response.ok && data.orders) {
                setOrders(data.orders);
            } else {
                setOrders([]);
                if (response.status !== 404) {
                    toast.error("Failed to fetch orders");
                }
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders based on search term
    const filteredOrders = useMemo(() => {
        if (!searchTerm.trim()) return orders;

        return orders.filter((order) => {
            const customerName =
                typeof order.customer === "object" ? order.customer.name : "";
            const customerPhone =
                typeof order.customer === "object" ? order.customer.phone : "";
            const searchLower = searchTerm.toLowerCase().trim();

            return (
                order._id.toLowerCase().includes(searchLower) ||
                order.status.toLowerCase().includes(searchLower) ||
                customerName.toLowerCase().includes(searchLower) ||
                customerPhone.includes(searchLower) ||
                order.modeOfPayment.toLowerCase().includes(searchLower)
            );
        });
    }, [orders, searchTerm]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "delivered":
                return { variant: "default" as const, icon: CheckCircle };
            case "pending":
            case "processing":
                return { variant: "secondary" as const, icon: Clock };
            case "cancelled":
            case "failed":
                return { variant: "destructive" as const, icon: AlertCircle };
            default:
                return { variant: "outline" as const, icon: Clock };
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );
        const totalPaid = orders.reduce(
            (sum, order) => sum + order.paidAmount,
            0
        );
        const totalDue = orders.reduce(
            (sum, order) => sum + order.dueAmount,
            0
        );
        const pendingOrders = orders.filter(
            (order) =>
                order.status?.toLowerCase() === "pending" ||
                order.status?.toLowerCase() === "processing"
        ).length;

        return {
            totalOrders: orders.length,
            totalRevenue,
            totalPaid,
            totalDue,
            pendingOrders,
        };
    }, [orders]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8" />
                        Orders
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and track all customer orders
                    </p>
                </div>

                <Button asChild>
                    <Link href="/" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Order
                    </Link>
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="md:col-span-1">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Orders
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.totalOrders}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending Orders
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.pendingOrders}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Amount Due
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(stats.totalDue)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Orders List
                        </span>
                        <Badge variant="secondary">
                            {searchTerm
                                ? `${filteredOrders.length} of ${orders.length}`
                                : `${orders.length} total`}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {searchTerm
                            ? `Showing results for "${searchTerm}"`
                            : "All orders in your system"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Paid Amount</TableHead>
                                    <TableHead>Due Amount</TableHead>
                                    <TableHead>Payment Mode</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead className="w-20">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center py-8"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading orders...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const statusInfo = getStatusBadge(
                                            order.status
                                        );
                                        const StatusIcon = statusInfo.icon;
                                        const customerInfo =
                                            typeof order.customer === "object"
                                                ? order.customer
                                                : null;

                                        return (
                                            <TableRow key={order._id}>
                                                <TableCell>
                                                    <div className="font-mono text-sm">
                                                        {order._id
                                                            .slice(-8)
                                                            .toUpperCase()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {customerInfo ? (
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    customerInfo.name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {
                                                                    customerInfo.phone
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">
                                                            Customer Info Not
                                                            Available
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            statusInfo.variant
                                                        }
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        {order.status ||
                                                            "Pending"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            order.totalAmount
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-green-600">
                                                        {formatCurrency(
                                                            order.paidAmount
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {order.dueAmount > 0 ? (
                                                        <span className="font-medium text-red-600">
                                                            {formatCurrency(
                                                                order.dueAmount
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            ₹0.00
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <CreditCard className="h-3 w-3" />
                                                        {order.modeOfPayment ||
                                                            "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/orders/${order._id}`}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            {searchTerm
                                                ? `No orders found matching "${searchTerm}"`
                                                : "No orders found. Create your first order to get started!"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
