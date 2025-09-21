"use client";

import React, { useEffect, useState } from "react";
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
  email: z
    .string()
    .email({ message: "Invalid email." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, {
      message: "Phone number must be at least 10 characters.",
    })
    .regex(/^[+]?[\d\s\-\(\)]+$/, {
      message: "Please enter a valid phone number.",
    }),
  customerId: z.string().optional(),
  status: z.string().min(1, { message: "Order status is required." }),
  remarks: z.string().optional(),
  paidAmount: z.number().min(0, { message: "Paid amount must be positive." }),
  dueAmount: z.number().min(0, { message: "Due amount must be positive." }),
  modeOfPayment: z.string().min(1, { message: "Payment mode is required." }),
});

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      email: "",
      phone: "",
      customerId: "",
      status: "",
      remarks: "",
      paidAmount: 0,
      dueAmount: 0,
      modeOfPayment: "",
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

  useEffect(() => {
    fetchCustomers();
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (item: InventoryItem) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToOrder = (item: InventoryItem) => {
    const existingItem = orderItems.find(
      (orderItem) => orderItem.itemId === item._id
    );

    if (existingItem) {
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

  const removeItemFromOrder = (itemId: string) => {
    const item = orderItems.find((orderItem) => orderItem.itemId === itemId);
    setOrderItems(
      orderItems.filter((orderItem) => orderItem.itemId !== itemId)
    );
    if (item) {
      toast.success(`Removed ${item.itemName} from order`);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);

  const phoneValue = form.watch("phone");

  useEffect(() => {
    if (phoneValue && phoneValue.length >= 10) {
      const cleanPhone = phoneValue.replace(/[\s\-\(\)]/g, "");
      const matchingCustomer = customers.find(
        (customer: Customer) =>
          customer.phone === cleanPhone || customer.phone === phoneValue
      );

      if (matchingCustomer) {
        const currentName = form.getValues("customerName");
        if (currentName !== matchingCustomer.name) {
          form.setValue("customerName", matchingCustomer.name);
          form.setValue("customerId", matchingCustomer._id);
          if (matchingCustomer.email) {
            form.setValue("email", matchingCustomer.email);
          }
          toast.success(`Customer found: ${matchingCustomer.name}`);
        }
      } else {
        if (phoneValue.length >= 10) {
          const currentName = form.getValues("customerName");
          if (currentName) {
            form.setValue("customerName", "");
            form.setValue("customerId", "");
            form.setValue("email", "");
            toast.info("Customer not found. Please enter details manually.");
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneValue, customers]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the order
      const orderPayload = {
        name: values.customerName,
        email: values.email || "",
        phone: values.phone,
        order: {
          status: values.status,
          remarks: values.remarks || "",
          paidAmount: values.paidAmount,
          dueAmount: values.dueAmount,
          modeOfPayment: values.modeOfPayment,
          totalAmount,
          discount: 0,
        },
      };

      console.log("Submitting order:", orderPayload);

      const orderResponse = await fetch("/api/order/add-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderResponse.json();
      console.log("Order response:", orderData);

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Step 2: Add order items if order was created successfully
      if (orderData.order && orderData.order._id) {
        console.log("Adding order items for order:", orderData.order._id);

        const orderItemPromises = orderItems.map(async (item) => {
          const itemPayload = {
            order: orderData.order._id,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.itemPrice,
            total: item.amount,
          };

          console.log("Adding order item:", itemPayload);

          const itemResponse = await fetch("/api/order/add-orderitem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemPayload),
          });

          if (!itemResponse.ok) {
            const itemData = await itemResponse.json();
            console.error("Failed to add order item:", itemData);
            throw new Error(`Failed to add item: ${item.itemName}`);
          }

          return itemResponse.json();
        });

        await Promise.all(orderItemPromises);
        console.log("All order items added successfully");
      }

      toast.success("Order submitted successfully!");

      // Reset form and state
      form.reset();
      setOrderItems([]);
      setSearchTerm("");

      // Refresh customers list to get updated data
      fetchCustomers();
    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast.error(error.message || "Failed to submit order.");
    } finally {
      setIsSubmitting(false);
    }
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
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer email (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Order details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. pending, confirmed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modeOfPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode of Payment *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Cash, Card, UPI"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paid Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Any additional notes..."
                            {...field}
                          />
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
                    {orderItems.length > 0 && (
                      <Badge variant="secondary">
                        {orderItems.length} item(s) added
                      </Badge>
                    )}
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
                                      {item._id.slice(-6)}
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
                                    {item.itemId.slice(-6)}
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
                                  className="text-right font-semibold text-lg"
                                >
                                  Total Amount:
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || orderItems.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      "Submit Order"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => {
                      form.reset();
                      setOrderItems([]);
                      setSearchTerm("");
                    }}
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
