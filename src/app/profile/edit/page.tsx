"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Save, Briefcase, Eye, Plus, X, Trash2 } from "lucide-react";
import { AvatarUpload, PhotoUpload } from "@/components/PhotoUpload";
import { AvailabilityGrid } from "@/components/AvailabilityGrid";

const cantons = [
  "Zürich", "Bern", "Luzern", "Uri", "Schwyz", "Obwalden", "Nidwalden",
  "Glarus", "Zug", "Fribourg", "Solothurn", "Basel-Stadt", "Basel-Landschaft",
  "Schaffhausen", "Appenzell Ausserrhoden", "Appenzell Innerrhoden",
  "St. Gallen", "Graubünden", "Aargau", "Thurgau", "Ticino", "Vaud",
  "Valais", "Neuchâtel", "Genève", "Jura",
];

const languageOptions = [
  { code: "uk", name: "Ukrainian" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
];

interface ServiceOption {
  id: string;
  name: string;
  slug: string;
}

interface EditableService {
  key: string;
  serviceId?: string;
  customName?: string;
  description: string;
  priceType: "HOURLY" | "FIXED" | "NEGOTIABLE";
  price: string;
}

export default function ProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    postalCode: "",
    city: "",
    canton: "",
    languages: [] as string[],
    avatarUrl: null as string | null,
  });
  const [providerData, setProviderData] = useState({
    photos: [] as string[],
    availability: {} as Record<string, boolean>,
  });
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<EditableService[]>([]);
  const [customServiceName, setCustomServiceName] = useState("");

  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user) {
      fetchProfile();
      fetchAvailableServices();
    }
  }, [status]);

  async function fetchAvailableServices() {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setAvailableServices(data);
      }
    } catch {
      // Services will load when available
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          canton: data.canton || "",
          languages: data.languages || [],
          avatarUrl: data.avatarUrl || null,
        });
        if (data.role === "PROVIDER" && data.providerProfile) {
          setIsProvider(true);
          setProviderData({
            photos: data.providerProfile.photos || [],
            availability: (data.providerProfile.availability as Record<string, boolean>) || {},
          });
          // Load existing services
          const existingServices: EditableService[] = data.providerProfile.services.map(
            (s: any) => ({
              key: s.serviceId || `custom-${s.id}`,
              serviceId: s.serviceId || undefined,
              customName: s.customName || undefined,
              description: s.description || "",
              priceType: s.priceType || "NEGOTIABLE",
              price: s.price ? String(s.price) : "",
            })
          );
          setSelectedServices(existingServices);
        }
      }
    } catch {
      // New user, use defaults
    }
  }

  const handleLanguageToggle = (code: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter((l) => l !== code)
        : [...prev.languages, code],
    }));
  };

  const handleAvatarUpload = (url: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: url }));
  };

  const addPredefinedService = (serviceId: string) => {
    if (selectedServices.find((s) => s.key === serviceId)) return;
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

  const removeServiceItem = (key: string) => {
    setSelectedServices(selectedServices.filter((s) => s.key !== key));
  };

  const updateServiceItem = (key: string, field: keyof EditableService, value: string) => {
    setSelectedServices(
      selectedServices.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          postalCode: profile.postalCode,
          city: profile.city,
          canton: profile.canton,
          languages: profile.languages,
          avatarUrl: profile.avatarUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
        return;
      }

      // Update provider profile if applicable
      if (isProvider) {
        const provRes = await fetch(`/api/providers/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: providerData.photos,
            availability: providerData.availability,
            services: selectedServices.map((s) => ({
              serviceId: s.serviceId || null,
              customName: s.customName || null,
              description: s.description,
              priceType: s.priceType,
              price: s.price ? parseFloat(s.price) : null,
            })),
          }),
        });

        if (!provRes.ok) {
          const data = await provRes.json();
          toast.error(data.error || "Failed to update provider profile");
          return;
        }
      }

      toast.success("Profile updated!");
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Edit Profile</h1>
        {userId && (
          <Link
            href={`/profile/${userId}`}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <Eye size={16} />
            View Public Profile
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar */}
        <AvatarUpload
          currentUrl={profile.avatarUrl}
          onUpload={handleAvatarUpload}
          name={profile.name}
        />

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Bio
            </label>
            <textarea
              className="input-field min-h-[120px]"
              placeholder="Tell people about yourself..."
              maxLength={500}
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
            />
            <p className="text-xs text-text-tertiary mt-1">
              {profile.bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
            Location
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Postal Code
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., 8001"
                maxLength={10}
                value={profile.postalCode}
                onChange={(e) =>
                  setProfile({ ...profile, postalCode: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                City
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Zürich"
                value={profile.city}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Canton
              </label>
              <select
                className="input-field"
                value={profile.canton}
                onChange={(e) =>
                  setProfile({ ...profile, canton: e.target.value })
                }
              >
                <option value="">Select canton</option>
                {cantons.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageToggle(lang.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  profile.languages.includes(lang.code)
                    ? "bg-brand-500 text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Section */}
        {isProvider && (
          <>
            {/* Services */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
                Your Services
              </h2>

              {/* Predefined service buttons */}
              <div className="flex flex-wrap gap-2">
                {availableServices.map((svc) => {
                  const isSelected = selectedServices.some((s) => s.key === svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() =>
                        isSelected ? removeServiceItem(svc.id) : addPredefinedService(svc.id)
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-brand-500 text-white"
                          : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                      }`}
                    >
                      {isSelected ? <X size={14} /> : <Plus size={14} />}
                      {svc.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom service input */}
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

              {/* Selected service details */}
              {selectedServices.length > 0 && (
                <div className="space-y-3">
                  {selectedServices.map((svc) => {
                    const name = svc.serviceId
                      ? availableServices.find((s) => s.id === svc.serviceId)?.name
                      : svc.customName;
                    return (
                      <div key={svc.key} className="p-4 bg-surface-secondary rounded-card space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {name}
                            {svc.customName && (
                              <span className="ml-2 text-xs text-text-tertiary">(custom)</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeServiceItem(svc.key)}
                            className="text-text-tertiary hover:text-text-primary"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <textarea
                          className="input-field text-sm"
                          placeholder="Describe what you offer..."
                          rows={2}
                          value={svc.description}
                          onChange={(e) => updateServiceItem(svc.key, "description", e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            className="input-field text-sm"
                            value={svc.priceType}
                            onChange={(e) => updateServiceItem(svc.key, "priceType", e.target.value)}
                          >
                            <option value="NEGOTIABLE">Negotiable</option>
                            <option value="HOURLY">Per hour</option>
                            <option value="FIXED">Fixed price</option>
                          </select>
                          {svc.priceType !== "NEGOTIABLE" && (
                            <input
                              type="number"
                              min="0"
                              step="5"
                              className="input-field text-sm"
                              placeholder="CHF"
                              value={svc.price}
                              onChange={(e) => updateServiceItem(svc.key, "price", e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Work Photos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
                Work Photos
              </h2>
              <PhotoUpload
                photos={providerData.photos}
                onChange={(photos) =>
                  setProviderData({ ...providerData, photos })
                }
                maxPhotos={6}
                label="Showcase your work"
              />
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
                Availability
              </h2>
              <AvailabilityGrid
                value={providerData.availability}
                onChange={(availability) =>
                  setProviderData({ ...providerData, availability })
                }
              />
            </div>
          </>
        )}

        {/* Not a provider yet */}
        {!isProvider && (
          <div className="bg-brand-50 rounded-card p-6 border border-brand-100">
            <div className="flex items-start gap-3">
              <Briefcase size={24} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Offer your services?
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  Create a provider profile to list your services and connect
                  with people who need your skills.
                </p>
                <Link
                  href="/provider/setup"
                  className="btn-primary text-sm inline-block"
                >
                  Become a Provider
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Delete Account */}
      <div className="mt-16 pt-8 border-t border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          type="button"
          onClick={async () => {
            if (
              !window.confirm(
                "Are you sure you want to delete your account? This cannot be undone."
              )
            )
              return;
            try {
              const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
              });
              if (res.ok) {
                toast.success("Account deleted");
                await signOut({ callbackUrl: "/" });
              } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete account");
              }
            } catch {
              toast.error("Something went wrong");
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete My Account
        </button>
      </div>
    </div>
  );
}
