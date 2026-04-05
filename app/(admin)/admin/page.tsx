"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, TrendingUp, Users, Star, Clock, Eye } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Stats {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  paidOrders: number;
  totalProducts: number;
  uniqueCustomers: number;
  pendingReviews: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  const statCards = stats
    ? [
        {
          title: "Total Orders",
          value: stats.totalOrders.toString(),
          icon: ShoppingCart,
          color: "bg-blue-500",
          description: `${stats.paidOrders} paid, ${stats.pendingOrders} pending`,
        },
        {
          title: "Revenue",
          value: formatPrice(stats.revenue),
          icon: TrendingUp,
          color: "bg-green-500",
          description: "From paid orders",
        },
        {
          title: "Products",
          value: stats.totalProducts.toString(),
          icon: Package,
          color: "bg-purple-500",
          description: "In catalog",
        },
        {
          title: "Customers",
          value: stats.uniqueCustomers.toString(),
          icon: Users,
          color: "bg-orange-500",
          description: "Unique customers",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the CLEOHN admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats && stats.pendingReviews > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Pending Reviews
            </CardTitle>
            <Link href="/admin/reviews">
              <Button size="sm" variant="outline">
                Review Now
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have {stats.pendingReviews} review{stats.pendingReviews > 1 ? "s" : ""} waiting for approval
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              {recentOrders.length > 0
                ? `Latest ${recentOrders.length} orders`
                : "No orders yet"}
            </CardDescription>
          </div>
          {recentOrders.length > 0 && (
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Orders will appear here once customers start placing them.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
