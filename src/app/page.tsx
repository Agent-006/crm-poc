"use client";

import React, { use, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { set } from "mongoose";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  orders: string[];
  totalAmountSpent: number;
  dueAmount: number;
  advancedAmount: number;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemInventory: number;
  totalSold: number;
}

const formSchema = z.object({
  customerName: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Phone number must be at least 10 characters.",
    })
    .regex(/^[+]?[\d\s\-\(\)]+$/, {
      message: "Please enter a valid phone number.",
    }),
    customerId: z.string()
});

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [orderItems, setOrderItems] = useState<
    Array<{
      itemId: string;
      itemName: string;
      itemPrice: number;
      quantity: number;
      amount: number;
    }>
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      customerId:""
    },
  });

  
  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await fetch("/api/customer/get-all-customer");
      const data = await response.json();

      if (response.ok && data.customers) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
        if (response.status !== 404) {
          toast.error("Failed to fetch customers");
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setIsLoadingInventory(true);
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
      setIsLoadingInventory(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCustomers();
    fetchInventory();
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(
    (item: InventoryItem) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to order
  const addItemToOrder = (item: InventoryItem) => {
    const existingItem = orderItems.find(
      (orderItem) => orderItem.itemId === item._id
    );

    if (existingItem) {
      // If item already exists, increase quantity
      setOrderItems(
        orderItems.map((orderItem) =>
          orderItem.itemId === item._id
            ? {
                ...orderItem,
                quantity: orderItem.quantity + 1,
                amount: (orderItem.quantity + 1) * orderItem.itemPrice,
              }
            : orderItem
        )
      );
      toast.success(`Added another ${item.itemName} to order`);
    } else {
      // Add new item to order
      const newOrderItem = {
        itemId: item._id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        quantity: 1,
        amount: item.itemPrice,
      };
      setOrderItems([...orderItems, newOrderItem]);
      toast.success(`Added ${item.itemName} to order`);
    }
  };

  // Update quantity of item in order
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              quantity: newQuantity,
              amount: newQuantity * item.itemPrice,
            }
          : item
      )
    );
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    const item = orderItems.find((orderItem) => orderItem.itemId === itemId);
    setOrderItems(
      orderItems.filter((orderItem) => orderItem.itemId !== itemId)
    );
    if (item) {
      toast.success(`Removed ${item.itemName} from order`);
    }
  };

  // Calculate total amount
  const totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);

  // Watch for phone number changes and auto-fill customer data
  const phoneValue = form.watch("phone");

  useEffect(() => {
    if (phoneValue && phoneValue.length >= 10) {
      // Clean the phone number (remove spaces, dashes, parentheses)
      const cleanPhone = phoneValue.replace(/[\s\-\(\)]/g, "");

      // Find matching customer by phone number
      const matchingCustomer = customers.find(
        (customer: Customer) =>
          customer.phone === cleanPhone || customer.phone === phoneValue
      );

      if (matchingCustomer) {
        // Auto-fill customer name and ID
        form.setValue("customerName", matchingCustomer.name);
        form.setValue("customerId", matchingCustomer._id);

        // Show success toast
        toast.success(`Customer found: ${matchingCustomer.name}`);
      } else {
        // Clear fields if no match found and show info toast
        if (phoneValue.length >= 10) {
          form.setValue("customerName", "");
          form.setValue("customerId", "");
          toast.info("Customer not found. Please enter details manually.");
        }
      }
    }
  }, [phoneValue, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const orderData = {
      ...values,
      orderItems,
      totalAmount,
      orderDate: new Date().toISOString(),
    };
    console.log(orderData);

    // Here you would typically send the data to your API
    toast.success("Order submitted successfully!");
    form.reset();
    setOrderItems([]);
    setSearchTerm("");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-none">
      <div className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
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
                        <FormLabel>Customer ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Inventory Search and Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      Add Items to Order
                    </h3>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search inventory by name or item ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Inventory Table */}
                  {searchTerm && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Available Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-60 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Item ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-24">Price</TableHead>
                                <TableHead className="w-20">Stock</TableHead>
                                <TableHead className="w-20">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isLoadingInventory ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="text-center py-8"
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading inventory...
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : filteredInventory.length > 0 ? (
                                filteredInventory.map((item: InventoryItem) => (
                                  <TableRow key={item._id}>
                                    <TableCell className="font-mono text-xs">
                                      {item._id}
                                    </TableCell>
                                    <TableCell className="max-w-32 truncate overflow-hidden">
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell>
                                      ₹{item.itemPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          item.itemInventory > 50
                                            ? "default"
                                            : item.itemInventory > 10
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {item.itemInventory}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => addItemToOrder(item)}
                                        disabled={item.itemInventory <= 0}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="text-center text-gray-500"
                                  >
                                    {searchTerm
                                      ? `No items found matching "${searchTerm}"`
                                      : "No items available in inventory"}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Items Table */}
                {orderItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Item ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-24">Price</TableHead>
                                <TableHead className="w-32">Quantity</TableHead>
                                <TableHead className="w-24">Amount</TableHead>
                                <TableHead className="w-16">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderItems.map((item) => (
                                <TableRow key={item.itemId}>
                                  <TableCell className="font-mono text-xs">
                                    {item.itemId}
                                  </TableCell>
                                  <TableCell className="max-w-32 truncate overflow-hidden">
                                    {item.itemName}
                                  </TableCell>
                                  <TableCell>
                                    ₹{item.itemPrice.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          updateQuantity(
                                            item.itemId,
                                            item.quantity - 1
                                          )
                                        }
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          updateQuantity(
                                            item.itemId,
                                            item.quantity + 1
                                          )
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    ₹{item.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        removeItemFromOrder(item.itemId)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-right font-semibold"
                                >
                                  Total:
                                </TableCell>
                                <TableCell className="font-bold text-lg">
                                  ₹{totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Separator />
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Order
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => form.reset()}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
