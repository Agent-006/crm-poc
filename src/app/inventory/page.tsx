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
  PackagePlus,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  Warehouse,
  TrendingUp,
  Eye,
  Edit,
  Archive,
} from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemInventory: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/inventory/get-item");
      const data = await response.json();

      if (response.ok && data.items) {
        setInventory(data.items);
      } else {
        setInventory([]);
        if (response.status !== 404) {
          toast.error("Failed to fetch inventory");
        }
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter inventory based on search term
  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventory;

    return inventory.filter(
      (item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item._id.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [inventory, searchTerm]);

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
    });
  };

  // Get stock status badge
  const getStockBadge = (quantity: number) => {
    if (quantity <= 0) {
      return {
        variant: "destructive" as const,
        label: "Out of Stock",
        icon: AlertTriangle,
      };
    } else if (quantity <= 10) {
      return {
        variant: "secondary" as const,
        label: "Low Stock",
        icon: AlertTriangle,
      };
    } else if (quantity <= 50) {
      return {
        variant: "outline" as const,
        label: "Medium Stock",
        icon: Package,
      };
    } else {
      return { variant: "default" as const, label: "In Stock", icon: Package };
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalStockValue = inventory.reduce(
      (sum, item) => sum + item.itemPrice * item.itemInventory,
      0
    );
    const totalSoldValue = inventory.reduce(
      (sum, item) => sum + item.itemPrice * item.totalSold,
      0
    );
    const lowStockItems = inventory.filter(
      (item) => item.itemInventory <= 10
    ).length;
    const outOfStockItems = inventory.filter(
      (item) => item.itemInventory <= 0
    ).length;
    const totalUnits = inventory.reduce(
      (sum, item) => sum + item.itemInventory,
      0
    );

    return {
      totalItems,
      totalStockValue,
      totalSoldValue,
      lowStockItems,
      outOfStockItems,
      totalUnits,
    };
  }, [inventory]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Warehouse className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your product inventory
          </p>
        </div>

        <Button asChild>
          <Link href="/inventory/add-item" className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items..."
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
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalStockValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sales Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalSoldValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Items
            </span>
            <Badge variant="secondary">
              {searchTerm
                ? `${filteredInventory.length} of ${inventory.length}`
                : `${inventory.length} total`}
            </Badge>
          </CardTitle>
          <CardDescription>
            {searchTerm
              ? `Showing results for "${searchTerm}"`
              : "All inventory items in your warehouse"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Total Sold</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const stockInfo = getStockBadge(item.itemInventory);
                    const StockIcon = stockInfo.icon;
                    const stockValue = item.itemPrice * item.itemInventory;

                    return (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              ID: {item._id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(item.itemPrice)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={stockInfo.variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            <StockIcon className="h-3 w-3" />
                            {stockInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {item.itemInventory}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              units
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">
                              {item.totalSold}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              sold
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(stockValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/inventory/${item._id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? `No items found matching "${searchTerm}"`
                        : "No items found. Add your first inventory item to get started!"}
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
