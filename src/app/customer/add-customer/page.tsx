"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  BadgeAlert,
  User,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  totalAmountSpent: number;
  dueAmount: number;
  advancedAmount: number;
}

export default function AddCustomerPage() {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    totalAmountSpent: 0,
    dueAmount: 0,
    advancedAmount: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Amount") || name.includes("Spent")
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      setAlert({
        type: "error",
        message: "Name and phone number are required fields.",
      });
      return;
    }
    if (formData.phone.length < 10) {
      setAlert({
        type: "error",
        message: "Phone number must be at least 10 characters.",
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const response = await fetch("/api/add-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setAlert({
          type: "success",
          message: `Customer "${formData.name}" (${formData.phone}) added successfully!`,
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          totalAmountSpent: 0,
          dueAmount: 0,
          advancedAmount: 0,
        });
      } else {
        setAlert({
          type: "error",
          message:
            result.message || "Failed to add customer. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
      console.error("Error adding customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Customer</h1>
        <p className="text-muted-foreground mt-2">
          Create a new customer profile for your CRM system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">New Customer</Badge>
            Customer Information
          </CardTitle>
          <CardDescription>
            Fill in the customer details below. Name and phone number are
            required fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alert && (
            <div
              className={`px-1 border-l-4 rounded flex items-center gap-2 mb-2 py-2 ${
                alert.type === "error"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-green-500 bg-green-50 text-green-700"
              }`}
            >
              {alert.type === "error" ? (
                <BadgeAlert className="h-4 w-4 text-red-600" />
              ) : (
                <BadgeCheck className="h-4 w-4 text-green-600" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address (optional)"
                />
              </div>
            </div>

            {/* <Separator />

            // Financial Information Section 
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Optional: Set initial financial values for this customer
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmountSpent">Total Amount Spent</Label>
                  <Input
                    id="totalAmountSpent"
                    name="totalAmountSpent"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmountSpent}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueAmount">Due Amount</Label>
                  <Input
                    id="dueAmount"
                    name="dueAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dueAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advancedAmount">Advanced Amount</Label>
                  <Input
                    id="advancedAmount"
                    name="advancedAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.advancedAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div> */}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !formData.name || !formData.phone}
              >
                {isSubmitting ? "Adding Customer..." : "Add Customer"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    totalAmountSpent: 0,
                    dueAmount: 0,
                    advancedAmount: 0,
                  });
                  setAlert(null);
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
