"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Package as PackageIcon,
  CheckCircle2,
  Info,
  ListChecks,
  Layers,
  DollarSign,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  processingTime?: string;
  featured: boolean;
  displayOrder: number;
  isPopular: boolean;
  pricingDescription?: string;
  featureCount: number;
}

interface Phase {
  name: string;
  cost: string;
  detail: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  serviceId: string;
  cost?: string;
  delivery?: string;
  infoPoints?: string;
  types?: string;
  phases?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function ServiceItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string;

  const [item, setItem] = useState<ServiceItem | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingPackage, setUpdatingPackage] = useState<string | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Editable state for service item details
  const [editCost, setEditCost] = useState("");
  const [editDelivery, setEditDelivery] = useState("");
  const [editInfoPoints, setEditInfoPoints] = useState<string[]>([]);
  const [editTypes, setEditTypes] = useState<string[]>([]);
  const [editPhases, setEditPhases] = useState<Phase[]>([]);

  useEffect(() => {
    if (itemId) {
      fetchItemAndPackages();
    }
  }, [itemId]);

  const fetchItemAndPackages = async () => {
    try {
      const itemRes = await fetch(`/api/admin/service-items/${itemId}`);
      if (itemRes.ok) {
        const itemData = await itemRes.json();
        setItem(itemData);
        initEditState(itemData);
      }

      const packagesRes = await fetch(`/api/admin/service-items/${itemId}/packages`);
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackages(packagesData);
      }
    } catch (error) {
      toast.error("An error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const initEditState = (data: ServiceItem) => {
    setEditCost(data.cost || "");
    setEditDelivery(data.delivery || "");
    setEditInfoPoints(data.infoPoints ? JSON.parse(data.infoPoints) : []);
    setEditTypes(data.types ? JSON.parse(data.types) : []);
    setEditPhases(data.phases ? JSON.parse(data.phases) : []);
  };

  const saveDetails = async () => {
    setIsSavingDetails(true);
    try {
      const response = await fetch(`/api/admin/service-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cost: editCost || null,
          delivery: editDelivery || null,
          infoPoints: editInfoPoints.length > 0 ? JSON.stringify(editInfoPoints) : null,
          types: editTypes.length > 0 ? JSON.stringify(editTypes) : null,
          phases: editPhases.length > 0 ? JSON.stringify(editPhases) : null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItem((prev) => prev ? { ...prev, ...updated } : prev);
        setIsEditingDetails(false);
        toast.success("Service item details updated");
      } else {
        toast.error("Failed to update details");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const toggleFeatured = async (packageId: string, currentFeatured: boolean) => {
    setUpdatingPackage(packageId);
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        setPackages(packages.map(pkg =>
          pkg.id === packageId ? { ...pkg, featured: !currentFeatured } : pkg
        ));
        toast.success(`Package ${!currentFeatured ? 'added to' : 'removed from'} pricing page`);
      } else {
        toast.error("Failed to update package");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setUpdatingPackage(null);
    }
  };

  const togglePopular = async (packageId: string, currentPopular: boolean) => {
    setUpdatingPackage(packageId);
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopular: !currentPopular }),
      });

      if (response.ok) {
        setPackages(packages.map(pkg =>
          pkg.id === packageId ? { ...pkg, isPopular: !currentPopular } : pkg
        ));
        toast.success(`"BEST VALUE" badge ${!currentPopular ? 'added' : 'removed'}`);
      } else {
        toast.error("Failed to update package");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setUpdatingPackage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Parse JSON data
  const infoPoints: string[] = item?.infoPoints ? JSON.parse(item.infoPoints) : [];
  const types: string[] = item?.types ? JSON.parse(item.types) : [];
  const phases: Phase[] = item?.phases ? JSON.parse(item.phases) : [];
  const hasExtraData = infoPoints.length > 0 || types.length > 0 || phases.length > 0 || item?.cost || item?.delivery;
  const featuredCount = packages.filter(p => p.featured).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/services")}
          className="hover:text-accent"
        >
          Categories
        </Button>
        <ChevronRight className="h-4 w-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/services/category/${item?.serviceId}`)}
          className="hover:text-accent"
        >
          {item?.category?.name}
        </Button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{item?.title}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{item?.title}</h1>
        <p className="text-muted-foreground mt-2">{item?.description}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Pricing Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{featuredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Info Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infoPoints.length + types.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phases.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Item Details (non-package data) */}
      {(hasExtraData || isEditingDetails) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Service Details</h2>
            {!isEditingDetails ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (item) initEditState(item);
                  setIsEditingDetails(true);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Details
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingDetails(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveDetails}
                  disabled={isSavingDetails}
                  className="gap-2"
                >
                  {isSavingDetails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          {isEditingDetails ? (
            <div className="space-y-6">
              {/* Cost & Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing & Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cost</label>
                      <Input
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        placeholder="e.g., ₦45,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Delivery Time</label>
                      <Input
                        value={editDelivery}
                        onChange={(e) => setEditDelivery(e.target.value)}
                        placeholder="e.g., 7 working days"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Info Points (Why it matters)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editInfoPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const updated = [...editInfoPoints];
                          updated[idx] = e.target.value;
                          setEditInfoPoints(updated);
                        }}
                        placeholder="Info point"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditInfoPoints(editInfoPoints.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditInfoPoints([...editInfoPoints, ""])}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Info Point
                  </Button>
                </CardContent>
              </Card>

              {/* Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Service Types / Variations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editTypes.map((type, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={type}
                        onChange={(e) => {
                          const updated = [...editTypes];
                          updated[idx] = e.target.value;
                          setEditTypes(updated);
                        }}
                        placeholder="Service type"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTypes(editTypes.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditTypes([...editTypes, ""])}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Type
                  </Button>
                </CardContent>
              </Card>

              {/* Phases */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Registration Phases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editPhases.map((phase, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Phase {idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditPhases(editPhases.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Name</label>
                          <Input
                            value={phase.name}
                            onChange={(e) => {
                              const updated = [...editPhases];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setEditPhases(updated);
                            }}
                            placeholder="e.g., Phase 1: Search"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Cost</label>
                          <Input
                            value={phase.cost}
                            onChange={(e) => {
                              const updated = [...editPhases];
                              updated[idx] = { ...updated[idx], cost: e.target.value };
                              setEditPhases(updated);
                            }}
                            placeholder="e.g., ₦10,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Detail</label>
                        <Textarea
                          value={phase.detail}
                          onChange={(e) => {
                            const updated = [...editPhases];
                            updated[idx] = { ...updated[idx], detail: e.target.value };
                            setEditPhases(updated);
                          }}
                          placeholder="Description of this phase..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditPhases([...editPhases, { name: "", cost: "", detail: "" }])}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Phase
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cost & Delivery Display */}
              {(item?.cost || item?.delivery) && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-8">
                      {item.cost && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Cost</p>
                          <p className="text-2xl font-bold text-accent">{item.cost}</p>
                        </div>
                      )}
                      {item.delivery && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Processing Time</p>
                          <p className="text-2xl font-bold text-accent">{item.delivery}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Points Display */}
              {infoPoints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-accent" />
                      Why It Matters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {infoPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Types Display */}
              {types.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-accent" />
                      Service Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {types.map((type, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          <span>{type}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Phases Display */}
              {phases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accent" />
                      Registration Phases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-3">
                      {phases.map((phase, idx) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-xl border text-center">
                          <h4 className="font-bold text-accent text-sm mb-1">{phase.name}</h4>
                          <div className="text-lg font-bold mb-1">{phase.cost}</div>
                          <p className="text-xs text-muted-foreground leading-tight">{phase.detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pricing Packages</h2>
          {packages.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <PackageIcon className="h-3 w-3" />
              Toggle featured to show on pricing page
            </Badge>
          )}
        </div>

        {packages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PackageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No pricing packages for this service.
                {hasExtraData && " This service uses direct pricing / informational content instead."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`transition-all duration-200 border-2 ${
                  pkg.featured ? 'border-accent shadow-md' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            {pkg.isPopular && (
                              <Badge className="gap-1 bg-accent">
                                <Star className="h-3 w-3 fill-current" />
                                BEST VALUE
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-2xl font-bold text-accent">
                              ₦{pkg.price.toLocaleString()}
                            </span>
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {pkg.featureCount} deliverables
                            </Badge>
                          </div>
                          {pkg.processingTime && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Processing: {pkg.processingTime}
                            </p>
                          )}
                          {pkg.pricingDescription && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              {pkg.pricingDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Show on Pricing Page</label>
                          <Switch
                            checked={pkg.featured}
                            onCheckedChange={() => toggleFeatured(pkg.id, pkg.featured)}
                            disabled={updatingPackage === pkg.id}
                          />
                        </div>

                        {pkg.featured && (
                          <>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium">&quot;BEST VALUE&quot; Badge</label>
                              <Switch
                                checked={pkg.isPopular}
                                onCheckedChange={() => togglePopular(pkg.id, pkg.isPopular)}
                                disabled={updatingPackage === pkg.id}
                              />
                            </div>
                            <div className="h-4 w-px bg-border" />
                            <Badge variant="outline" className="gap-1">
                              Display Order: {pkg.displayOrder || 0}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/packages/${pkg.id}/edit`)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
