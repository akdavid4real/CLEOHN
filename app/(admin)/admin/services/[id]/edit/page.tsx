"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ServiceForm } from "@/components/admin/service-form";
import { Card, CardContent } from "@/components/ui/card";

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
      } catch (error) {
        console.error("Error loading service:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Service not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <ServiceForm initialData={service} />
    </div>
  );
}
