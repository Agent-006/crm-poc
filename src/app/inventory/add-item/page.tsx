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
  Package,
  DollarSign,
  Hash,
  Warehouse,
} from "lucide-react";

interface ItemFormData {
  itemName: string;
  itemPrice: number;
  itemInventory: number;
}

export default function AddItemPage() {
  const [formData, setFormData] = useState<ItemFormData>({
    itemName: "",
    itemPrice: 0,
    itemInventory: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "itemName" ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.itemName.trim()) {
      setAlert({
        type: "error",
        message: "Item name is required.",
      });
      return;
    }

    if (formData.itemPrice <= 0) {
      setAlert({
        type: "error",
        message: "Item price must be greater than 0.",
      });
      return;
    }

    if (formData.itemInventory < 0) {
      setAlert({
        type: "error",
        message: "Item inventory cannot be negative.",
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const response = await fetch("/api/inventory/add-item", {
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
          message: `Item "${formData.itemName}" added successfully with ${formData.itemInventory} units in stock!`,
        });

        // Reset form after successful submission
        setFormData({
          itemName: "",
          itemPrice: 0,
          itemInventory: 0,
        });
      } else {
        setAlert({
          type: "error",
          message: result.message || "Failed to add item. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
      console.error("Error adding item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      itemName: "",
      itemPrice: 0,
      itemInventory: 0,
    });
    setAlert(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Warehouse className="h-8 w-8" />
          Add New Inventory Item
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new item to your inventory with pricing and stock information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">New Item</Badge>
            <Package className="h-5 w-5" />
            Inventory Item Information
          </CardTitle>
          <CardDescription>
            Fill in the item details below. All fields are required to add the
            item to inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alert && (
            <div
              className={`px-4 border-l-4 rounded flex items-center gap-2 mb-2 py-3 ${
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
            {/* Item Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Details
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Item Name *
                  </Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    placeholder="Enter item name (e.g., Wireless Headphones)"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="itemPrice"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Item Price *
                    </Label>
                    <Input
                      id="itemPrice"
                      name="itemPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.itemPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="itemInventory"
                      className="flex items-center gap-2"
                    >
                      <Hash className="h-4 w-4" />
                      Initial Stock Quantity *
                    </Label>
                    <Input
                      id="itemInventory"
                      name="itemInventory"
                      type="number"
                      min="0"
                      value={formData.itemInventory}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Summary Section */}
            {formData.itemName && formData.itemPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Summary:
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Item:</strong> {formData.itemName}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{formData.itemPrice.toFixed(2)}
                  </p>
                  <p>
                    <strong>Stock:</strong> {formData.itemInventory} units
                  </p>
                  {formData.itemPrice > 0 && formData.itemInventory > 0 && (
                    <p>
                      <strong>Total Value:</strong> ₹
                      {(formData.itemPrice * formData.itemInventory).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isSubmitting ||
                  !formData.itemName.trim() ||
                  formData.itemPrice <= 0 ||
                  formData.itemInventory < 0
                }
              >
                {isSubmitting ? "Adding Item..." : "Add to Inventory"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={isSubmitting}
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
