"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X, Briefcase } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { AvailabilityGrid } from "@/components/AvailabilityGrid";

interface ServiceOption {
  id: string;
  name: string;
  slug: string;
}

interface SelectedService {
  key: string;
  serviceId?: string;
  customName?: string;
  description: string;
  priceType: "HOURLY" | "FIXED" | "NEGOTIABLE";
  price: string;
}

export default function ProviderSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [customServiceName, setCustomServiceName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    fetchServices();
  }, [status]);

  async function fetchServices() {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch {
      // Services will load when available
    }
  }

  const addService = (serviceId: string) => {
    if (selectedServices.find((s) => s.serviceId === serviceId)) return;
    setSelectedServices([
      ...selectedServices,
      { key: serviceId, serviceId, description: "", priceType: "NEGOTIABLE", price: "" },
    ]);
  };

  const addCustomService = () => {
    const name = customServiceName.trim();
    if (!name) return;
    if (selectedServices.find((s) => s.customName?.toLowerCase() === name.toLowerCase())) return;
    setSelectedServices([
      ...selectedServices,
      { key: `custom-${Date.now()}`, customName: name, description: "", priceType: "NEGOTIABLE", price: "" },
    ]);
    setCustomServiceName("");
  };

  const removeService = (key: string) => {
    setSelectedServices(selectedServices.filter((s) => s.key !== key));
  };

  const updateService = (
    key: string,
    field: keyof SelectedService,
    value: string
  ) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.key === key ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedServices.map((s) => ({
            serviceId: s.serviceId || null,
            customName: s.customName || null,
            description: s.description,
            priceType: s.priceType,
            price: s.price ? parseFloat(s.price) : null,
          })),
          photos,
          availability,
        }),
      });

      if (res.ok) {
        toast.success("Provider profile created!");
        router.push("/profile/edit");
      } else if (res.status === 401) {
        toast.error("Session expired. Please log out and log back in.");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container-page py-16 text-center text-text-secondary">
        Loading...
      </div>
    );
  }

  return (
    <div className="container-page py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={28} className="text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          Become a Provider
        </h1>
        <p className="mt-2 text-text-secondary">
          Select the services you offer and set your pricing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Add Services
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {services.map((service) => {
              const isSelected = selectedServices.some(
                (s) => s.key === service.id
              );
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    isSelected ? removeService(service.id) : addService(service.id)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-brand-500 text-white"
                      : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {isSelected ? (
                    <X size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                  {service.name}
                </button>
              );
            })}
          </div>

          {/* Custom Service Input */}
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field text-sm flex-1"
              placeholder="Or type your own service (e.g., Dog walking, Tutoring)"
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomService();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomService}
              disabled={!customServiceName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Selected Services Details */}
        {selectedServices.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-text-primary">Service Details</h3>
            {selectedServices.map((selected) => {
              const serviceName = selected.serviceId
                ? services.find((s) => s.id === selected.serviceId)?.name
                : selected.customName;
              return (
                <div
                  key={selected.key}
                  className="p-4 bg-surface-secondary rounded-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {serviceName}
                      {selected.customName && (
                        <span className="ml-2 text-xs text-text-tertiary">(custom)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeService(selected.key)}
                      className="text-text-tertiary hover:text-text-primary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <textarea
                    className="input-field text-sm"
                    placeholder="Describe what you offer for this service..."
                    rows={2}
                    value={selected.description}
                    onChange={(e) =>
                      updateService(
                        selected.key,
                        "description",
                        e.target.value
                      )
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="input-field text-sm"
                      value={selected.priceType}
                      onChange={(e) =>
                        updateService(
                          selected.key,
                          "priceType",
                          e.target.value
                        )
                      }
                    >
                      <option value="NEGOTIABLE">Negotiable</option>
                      <option value="HOURLY">Per hour</option>
                      <option value="FIXED">Fixed price</option>
                    </select>
                    {selected.priceType !== "NEGOTIABLE" && (
                      <input
                        type="number"
                        min="0"
                        step="5"
                        className="input-field text-sm"
                        placeholder="CHF"
                        value={selected.price}
                        onChange={(e) =>
                          updateService(
                            selected.key,
                            "price",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Work Photos */}
        <div>
          <h3 className="font-medium text-text-primary mb-2">
            Showcase Your Work
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Upload photos of your work to attract clients. You can always add
            more later.
          </p>
          <PhotoUpload
            photos={photos}
            onChange={setPhotos}
            maxPhotos={6}
            label="Work photos (optional)"
          />
        </div>

        {/* Availability */}
        <div>
          <h3 className="font-medium text-text-primary mb-2">
            Your Availability
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Let people know when you&apos;re generally available. You can update
            this anytime.
          </p>
          <AvailabilityGrid value={availability} onChange={setAvailability} />
        </div>

        <button
          type="submit"
          disabled={loading || selectedServices.length === 0}
          className="btn-primary w-full text-center"
        >
          {loading ? "Creating profile..." : "Create Provider Profile"}
        </button>
      </form>
    </div>
  );
}
