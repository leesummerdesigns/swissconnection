"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { Save, Briefcase, Eye, Plus, X, Trash2 } from "lucide-react";
import { AvatarUpload, PhotoUpload } from "@/components/PhotoUpload";
import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import { useTranslations } from "next-intl";

const cantons = [
  "Zürich", "Bern", "Luzern", "Uri", "Schwyz", "Obwalden", "Nidwalden",
  "Glarus", "Zug", "Fribourg", "Solothurn", "Basel-Stadt", "Basel-Landschaft",
  "Schaffhausen", "Appenzell Ausserrhoden", "Appenzell Innerrhoden",
  "St. Gallen", "Graubünden", "Aargau", "Thurgau", "Ticino", "Vaud",
  "Valais", "Neuchâtel", "Genève", "Jura",
];

const languageOptions = [
  { code: "uk" },
  { code: "de" },
  { code: "fr" },
  { code: "it" },
  { code: "en" },
  { code: "ru" },
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
  const t = useTranslations("profile");
  const tl = useTranslations("languageNames");
  const tc = useTranslations("common");
  const ta = useTranslations("availability");
  const tps = useTranslations("home");
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

  const handleAvatarUpload = async (url: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: url }));
    // Auto-save avatar immediately so it persists without needing form submit
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          postalCode: profile.postalCode,
          city: profile.city,
          canton: profile.canton,
          languages: profile.languages,
          avatarUrl: url,
        }),
      });
    } catch {
      // Will be saved with form submit as fallback
    }
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
        toast.error(data.error || tc("somethingWentWrong"));
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
          toast.error(data.error || tc("somethingWentWrong"));
          return;
        }
      }

      toast.success(t("profileUpdated"));
    } catch {
      toast.error(tc("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container-page py-16 text-center text-text-secondary">
        {tc("loading")}
      </div>
    );
  }

  return (
    <div className="container-page py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t("editProfile")}</h1>
        {userId && (
          <Link
            href={`/profile/${userId}`}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <Eye size={16} />
            {t("viewPublicProfile")}
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
            {t("basicInformation")}
          </h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t("fullName")}
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
              {t("bio")}
            </label>
            <textarea
              className="input-field min-h-[120px]"
              placeholder={t("bioPlaceholder")}
              maxLength={500}
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
            />
            <p className="text-xs text-text-tertiary mt-1">
              {t("bioCharCount", { count: profile.bio.length })}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
            {t("location")}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t("postalCode")}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={t("postalCodePlaceholder")}
                maxLength={10}
                value={profile.postalCode}
                onChange={(e) =>
                  setProfile({ ...profile, postalCode: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t("city")}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={t("cityPlaceholder")}
                value={profile.city}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t("canton")}
              </label>
              <select
                className="input-field"
                value={profile.canton}
                onChange={(e) =>
                  setProfile({ ...profile, canton: e.target.value })
                }
              >
                <option value="">{t("selectCanton")}</option>
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
            {t("languages")}
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
                {tl(lang.code)}
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
                {t("yourServices")}
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
                  placeholder={t("customServicePlaceholder")}
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
                  {t("add")}
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
                              <span className="ml-2 text-xs text-text-tertiary">{t("custom")}</span>
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
                          placeholder={t("describeService")}
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
                            <option value="NEGOTIABLE">{t("negotiable")}</option>
                            <option value="HOURLY">{t("perHour")}</option>
                            <option value="FIXED">{t("fixedPrice")}</option>
                          </select>
                          {svc.priceType !== "NEGOTIABLE" && (
                            <input
                              type="number"
                              min="0"
                              step="5"
                              className="input-field text-sm"
                              placeholder={tc("CHF")}
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
                {t("workPhotos")}
              </h2>
              <PhotoUpload
                photos={providerData.photos}
                onChange={(photos) =>
                  setProviderData({ ...providerData, photos })
                }
                maxPhotos={6}
                label={t("showcaseWork")}
              />
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary border-b border-surface-border pb-2">
                {ta("title")}
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
                  {t("offerServices")}
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  {t("offerServicesDescription")}
                </p>
                <Link
                  href="/provider/setup"
                  className="btn-primary text-sm inline-block"
                >
                  {tps("becomeProvider")}
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
            {loading ? t("saving") : t("saveProfile")}
          </button>
        </div>
      </form>

      {/* Delete Account */}
      <div className="mt-16 pt-8 border-t border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          {t("deleteAccount")}
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          {t("deleteAccountWarning")}
        </p>
        <button
          type="button"
          onClick={async () => {
            if (
              !window.confirm(
                t("deleteAccountConfirm")
              )
            )
              return;
            try {
              const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
              });
              if (res.ok) {
                toast.success(t("accountDeleted"));
                await signOut({ callbackUrl: "/" });
              } else {
                const data = await res.json();
                toast.error(data.error || tc("somethingWentWrong"));
              }
            } catch {
              toast.error(tc("somethingWentWrong"));
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          {t("deleteMyAccount")}
        </button>
      </div>
    </div>
  );
}
