"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Car } from "@/types";
import AdminVehicleCard from "./AdminVehicleCard";
import AdminEditDrawer from "./AdminEditDrawer";
import AdminEkspertizPanel, { DEFAULT_EKSPERTIZ } from "./AdminEkspertizPanel";
import type { FormData as CardFormData } from "./AdminVehicleCard";
import { uploadCarImage } from "@/utils/uploadCarImage";

/* -------------------------------------------------------------------------- */
/*  Form state tipi                                                           */
/* -------------------------------------------------------------------------- */
type FormData = CardFormData;

const defaultForm: FormData = {
  brand: "",
  model: "",
  year: "",
  price: "",
  km: "",
  fuel_type: "Benzin",
  transmission: "Otomatik",
  segment: "Orta Direk",
  status: "Aktif",
  video_url: "",
  esnaf_notu: "",
  ekspertiz_durumu: DEFAULT_EKSPERTIZ,
  is_featured: false,
  is_hero: false,
};

/* -------------------------------------------------------------------------- */
/*  Numerik yardimci                                                          */
/* -------------------------------------------------------------------------- */
const parseNumeric = (val: string): number | null => {
  const cleaned = val.replace(/[^0-9]/g, "");
  if (cleaned === "") return null;
  return Number(cleaned);
};

export default function AdminVehiclePanel() {
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [newCarImages, setNewCarImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>(defaultForm);
  const [editingSaving, setEditingSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [addingImageId, setAddingImageId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setVehicles([]);
      } else {
        setVehicles((data as Car[]) ?? []);
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*  Form yardimcilari                                                       */
  /* ------------------------------------------------------------------------ */
  const resetForm = () => {
    setForm(defaultForm);
    setNewCarImages([]);
    setSaveError(null);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  };

  const handleFormToggle = () => {
    setFormOpen((prev) => !prev);
    if (formOpen) {
      resetForm();
      setUploadError(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*  Fotoğraf Upload                                                         */
  /* ------------------------------------------------------------------------ */
  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError(null);
    try {
      const publicUrl = await uploadCarImage(file);
      setNewCarImages((prev) => [...prev, publicUrl]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Fotoğraf yüklenirken hata oluştu.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length === 0) return;
    if (formOpen) {
      imageItems.forEach((item) => {
        const file = item.getAsFile();
        if (file) handleFileUpload(file);
      });
    } else if (editingCarId) {
      imageItems.forEach((item) => {
        const file = item.getAsFile();
        if (file) handleAddImage(editingCarId, file);
      });
    }
  }, [formOpen, editingCarId]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleRemoveNewCarImage = (url: string) => {
    setNewCarImages((prev) => prev.filter((u) => u !== url));
  };

  const handleAddImage = async (carId: string, file: File) => {
    setAddingImageId(carId);
    try {
      const publicUrl = await uploadCarImage(file);
      setVehicles((prev) => {
        const car = prev.find((v) => v.id === carId);
        const newImages = [...(car?.images ?? []), publicUrl];
        supabase.from("cars").update({ images: newImages }).eq("id", carId).then(() => {});
        return prev.map((c) => c.id === carId ? { ...c, images: newImages } : c);
      });
    } catch {
      // silent — user can retry
    } finally {
      setAddingImageId(null);
    }
  };

  const handleRemoveImage = async (carId: string, imageUrl: string) => {
    setVehicles((prev) => {
      const car = prev.find((v) => v.id === carId);
      const newImages = (car?.images ?? []).filter((u) => u !== imageUrl);
      supabase.from("cars").update({ images: newImages }).eq("id", carId).then(() => {});
      return prev.map((c) => c.id === carId ? { ...c, images: newImages } : c);
    });
  };

  const handleDelete = async (carId: string) => {
    setDeletingId(carId);
    const { error: err } = await supabase.from("cars").delete().eq("id", carId);
    if (!err) setVehicles((prev) => prev.filter((c) => c.id !== carId));
    setDeletingId(null);
  };

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim() || !form.year.trim() || !form.price.trim() || !form.km.trim()) {
      setSaveError("Marka, model ve fiyat zorunludur.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const parsedPrice = parseNumeric(form.price);
    if (parsedPrice === null) {
      setSaveError("Geçerli bir fiyat girin.");
      setSaving(false);
      return;
    }

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: parseNumeric(form.year),
      price: parsedPrice,
      km: parseNumeric(form.km),
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      segment: form.segment,
      status: form.status,
      images: newCarImages,
      video_url: form.video_url.trim() || null,
      esnaf_notu: form.esnaf_notu.trim() || null,
      ekspertiz_durumu: form.ekspertiz_durumu,
      is_featured: form.is_featured,
      created_at: new Date().toISOString(),
    };

    const { data, error: err } = await supabase
      .from("cars")
      .insert(payload)
      .select()
      .single();

    if (err) {
      setSaveError(err.message);
      setSaving(false);
      return;
    }

    setVehicles((prev) => [data as Car, ...prev]);

    // Subscribers'a bildirim gönder
    try {
      const { data: subs } = await supabase
        .from("notifications_subscriptions")
        .select("*")
        .eq("is_active", true);

      if (subs && subs.length > 0) {
        const notificationPayload = subs.map((sub: any) => ({
          car_id: data.id,
          subscriber_email: sub.email,
          subscriber_phone: sub.phone,
        }));
        await supabase.from("notifications_sent").insert(notificationPayload);
      }
    } catch (notifError) {
      console.error("Bildirim gönderme hatası:", notifError);
    }

    resetForm();
    setFormOpen(false);
    setCurrentPage(1);
    setSaving(false);
  };

  /* ------------------------------------------------------------------------ */
  /*  Durum güncelleme                                                        */
  /* ------------------------------------------------------------------------ */
  const handleStatusChange = async (carId: string, newStatus: string) => {
    setUpdatingStatusId(carId);
    const { error: err } = await supabase
      .from("cars")
      .update({ status: newStatus })
      .eq("id", carId);

    if (err) {
      console.error("Durum güncellenemedi:", err.message);
    } else {
      setVehicles((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, status: newStatus as Car["status"] } : c))
      );
    }
    setUpdatingStatusId(null);
  };

  /* ------------------------------------------------------------------------ */
  /*  Vitrine çıkar / kaldır                                                  */
  /* ------------------------------------------------------------------------ */
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);

  const handleFeaturedToggle = async (carId: string, currentValue: boolean | undefined) => {
    const newValue = !currentValue;
    setUpdatingFeaturedId(carId);
    const { error: err } = await supabase
      .from("cars")
      .update({ is_featured: newValue })
      .eq("id", carId);

    if (err) {
      console.error("Vitrin durumu güncellenemedi:", err.message);
    } else {
      setVehicles((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, is_featured: newValue } : c))
      );
    }
    setUpdatingFeaturedId(null);
  };

  /* ------------------------------------------------------------------------ */
  /*  Hero aracı yap / kaldır                                                 */
  /* ------------------------------------------------------------------------ */
  const [updatingHeroId, setUpdatingHeroId] = useState<string | null>(null);

  const handleHeroToggle = async (carId: string, currentValue: boolean | undefined) => {
    const newValue = !currentValue;
    setUpdatingHeroId(carId);

    if (newValue) {
      // Önce tüm araçlarda is_hero'yu false yap
      const { error: resetErr } = await supabase
        .from("cars")
        .update({ is_hero: false })
        .neq("id", carId);

      if (resetErr) {
        console.error("Hero sıfırlanamadı:", resetErr.message);
        setUpdatingHeroId(null);
        return;
      }
    }

    // Seçilen aracı güncelle
    const { error: err } = await supabase
      .from("cars")
      .update({ is_hero: newValue })
      .eq("id", carId);

    if (err) {
      console.error("Hero durumu güncellenemedi:", err.message);
    } else {
      setVehicles((prev) =>
        prev.map((c) => ({
          ...c,
          is_hero: c.id === carId ? newValue : newValue ? false : c.is_hero,
        }))
      );
    }
    setUpdatingHeroId(null);
  };

  /* ------------------------------------------------------------------------ */
  /*  Düzenleme yardimcilari                                                  */
  /* ------------------------------------------------------------------------ */
  const carToFormData = (car: Car): FormData => ({
    brand: car.brand,
    model: car.model,
    year: String(car.year),
    price: String(car.price),
    km: String(car.km),
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    segment: car.segment,
    status: car.status,
    video_url: car.video_url ?? "",
    esnaf_notu: car.esnaf_notu ?? "",
    ekspertiz_durumu: (car.ekspertiz_durumu as import("@/types").EkspertizData) ?? DEFAULT_EKSPERTIZ,
    is_featured: car.is_featured ?? false,
    is_hero: car.is_hero ?? false,
  });

  const handleEditClick = (car: Car) => {
    setEditingCarId(car.id);
    setEditForm(carToFormData(car));
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingCarId(null);
    setEditForm(defaultForm);
    setEditError(null);
  };

  const handleEditChange = (field: keyof FormData, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: field === "is_featured" || field === "is_hero" ? value === "true" : value,
    }));
    setEditError(null);
  };

  const handleEditSave = async (carId: string) => {
    if (!editForm.brand.trim() || !editForm.model.trim() || !editForm.price.trim()) {
      setEditError("Marka, model ve fiyat zorunludur.");
      return;
    }

    setEditingSaving(true);
    setEditError(null);

    const parsedPrice = parseNumeric(editForm.price);
    if (parsedPrice === null) {
      setEditError("Geçerli bir fiyat girin.");
      setEditingSaving(false);
      return;
    }

    const payload = {
      brand: editForm.brand.trim(),
      model: editForm.model.trim(),
      year: parseNumeric(editForm.year),
      price: parsedPrice,
      km: parseNumeric(editForm.km),
      fuel_type: editForm.fuel_type,
      transmission: editForm.transmission,
      segment: editForm.segment,
      status: editForm.status,
      video_url: editForm.video_url.trim() || null,
      esnaf_notu: editForm.esnaf_notu.trim() || null,
      ekspertiz_durumu: editForm.ekspertiz_durumu,
      is_featured: editForm.is_featured,
    };

    const { error: err } = await supabase
      .from("cars")
      .update(payload)
      .eq("id", carId);

    if (err) {
      setEditError(err.message);
      setEditingSaving(false);
      return;
    }

    setVehicles((prev) =>
      prev.map((c) =>
        c.id === carId
          ? {
              ...c,
              brand: payload.brand,
              model: payload.model,
              year: payload.year ?? c.year,
              price: parsedPrice,
              km: payload.km ?? c.km,
              fuel_type: payload.fuel_type as Car["fuel_type"],
              transmission: payload.transmission as Car["transmission"],
              segment: payload.segment as Car["segment"],
              status: payload.status as Car["status"],
              video_url: payload.video_url ?? undefined,
              esnaf_notu: payload.esnaf_notu ?? undefined,
              is_featured: payload.is_featured,
            }
          : c
      )
    );
    handleEditCancel();
    setEditingSaving(false);
  };

  /* --- Filtre değişince sayfa 1'e dön --- */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  /* ------------------------------------------------------------------------ */
  /*  Filtreleme                                                              */
  /* ------------------------------------------------------------------------ */
  const statusCounts = { Tümü: vehicles.length };
  for (const s of ["Aktif", "Kaporalandı", "Satıldı", "Yayından Kaldırıldı"] as const) {
    statusCounts[s as keyof typeof statusCounts] = vehicles.filter((c) => c.status === s).length;
  }

  const filteredCars = vehicles.filter((car) => {
    const matchesSearch = !searchQuery.trim()
      || car.brand.toLowerCase().includes(searchQuery.trim().toLowerCase())
      || car.model.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesStatus = !statusFilter || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCars = filteredCars.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/3 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-4">
                <div className="mb-3 aspect-[16/10] rounded-lg bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <svg className="h-10 w-10 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm font-medium text-red-600">Araçlar yüklenirken hata oluştu</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
          <svg className="h-14 w-14 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
            <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
            <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Stokta henüz araç yok.</p>
            <p className="mt-1 text-xs text-gray-400">
              Yeni Araç Ekle butonuyla ilk aracı ekleyin.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFormToggle}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14m-7-7h14" />
            </svg>
            Yeni Araç Ekle
          </button>
        </div>
      </div>
    );
  }

  const activeCount = vehicles.filter((c) => c.status === "Aktif").length;
  const featuredCount = vehicles.filter((c) => c.is_featured).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* ── Header: başlık + istatistik + büyük ekle butonu ── */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-[#111827]">Stoktaki Araçlar</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
              <span><span className="font-bold text-[#111827]">{vehicles.length}</span> toplam</span>
              <span className="text-gray-200">|</span>
              <span><span className="font-bold text-emerald-600">{activeCount}</span> aktif</span>
              <span className="text-gray-200">|</span>
              <span><span className="font-bold text-blue-600">{featuredCount}</span> vitrinde</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFormToggle}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.97] ${
              formOpen
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-[#111827] text-white hover:bg-gray-800 shadow-sm"
            }`}
          >
            {formOpen ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Formu Kapat
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                + Yeni Araç Ekle
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Filtre çubuğu ── */}
      <div className="border-b border-gray-100 bg-gray-50/40 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Arama */}
          <div className="relative min-w-[180px] flex-1 max-w-xs">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Marka / model ara..."
              className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10"
            />
          </div>

          {/* Durum filtreleri — renkli pill'ler */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {([
              { label: "Tümü", value: null, color: "bg-[#111827] text-white", idle: "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50" },
              { label: "Aktif", value: "Aktif", color: "bg-emerald-600 text-white", idle: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" },
              { label: "Kaporalandı", value: "Kaporalandı", color: "bg-blue-500 text-white", idle: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" },
              { label: "Satıldı", value: "Satıldı", color: "bg-red-500 text-white", idle: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" },
              { label: "Yayından Kaldırıldı", value: "Yayından Kaldırıldı", color: "bg-gray-500 text-white", idle: "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100" },
            ] as const).map(({ label, value, color, idle }) => {
              const count = value === null ? vehicles.length : vehicles.filter((c) => c.status === value).length;
              const isActive = value === null ? !statusFilter : statusFilter === value;
              return (
                <button key={label} type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${isActive ? color : idle}`}>
                  {label}
                  <span className={`font-mono text-[10px] ${isActive ? "opacity-70" : "opacity-60"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Yeni Araç Formu ── */}
      {formOpen && (
        <div className="border-b border-gray-100 bg-[#f8f9fb] px-5 py-6 sm:px-6">

          {/* Form başlık */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14m-7-7h14" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111827]">Yeni Araç Ekle</h3>
              <p className="text-[11px] text-gray-400">Zorunlu alanları doldurup kaydedin</p>
            </div>
          </div>

          {/* Fotoğraf upload — öne çıkar */}
          <div className="mb-5 rounded-xl border-2 border-dashed border-gray-200 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Fotoğraflar</p>
            <div className="flex flex-wrap gap-2">
              {newCarImages.map((url, i) => (
                <div key={url} className="group/img relative h-20 w-28 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => handleRemoveNewCarImage(url)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover/img:opacity-100 shadow">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">Kapak</span>}
                </div>
              ))}
              <label className={`relative flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#111827] hover:text-[#111827] ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                <input type="file" accept="image/*" multiple className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    files.forEach((f) => handleFileUpload(f));
                    e.currentTarget.value = "";
                  }} />
                {uploadingImage ? (
                  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[10px] font-bold">Foto ekle</span>
                  </>
                )}
              </label>
              {newCarImages.length === 0 && !uploadingImage && (
                <div className="flex flex-col justify-center">
                  <p className="text-[11px] text-gray-400">Birden fazla fotoğraf seçebilirsiniz.</p>
                  <p className="text-[10px] text-gray-300">İlk fotoğraf kapak görseli olur.</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Kopyalanan görseli <kbd className="rounded bg-gray-100 px-1 font-mono text-[9px]">Ctrl+V</kbd> ile yapıştırabilirsiniz.</p>
                </div>
              )}
            </div>
            {uploadError && <p className="mt-2 text-xs font-medium text-red-500">{uploadError}</p>}
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              { key: "brand", label: "Marka", placeholder: "BMW", required: true },
              { key: "model", label: "Model", placeholder: "320i M Sport", required: true },
              { key: "year", label: "Yıl", placeholder: "2022", required: true },
              { key: "price", label: "Fiyat (₺)", placeholder: "2.850.000", required: true },
              { key: "km", label: "KM", placeholder: "22.000", required: true },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {label}{required && <span className="ml-0.5 text-red-400">*</span>}
                </label>
                <input type="text" value={form[key as keyof typeof form] as string}
                  onChange={(e) => handleFormChange(key as keyof typeof form, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
              </div>
            ))}

            {/* Select'ler */}
            {[
              { key: "fuel_type", label: "Yakıt", opts: [["Benzin","Benzin"],["Dizel","Dizel"],["Elektrik","Elektrik"],["Hibrit","Hibrit"],["LPG","LPG"]] },
              { key: "transmission", label: "Vites", opts: [["Otomatik","Otomatik"],["Manuel","Manuel"],["Yarı Otomatik","Yarı Otomatik"]] },
              { key: "segment", label: "Segment", opts: [["Kelepir","Fırsat"],["Orta Direk","Orta Segment"],["Premium","Premium"]] },
              { key: "status", label: "Durum", opts: [["Aktif","Aktif"],["Kaporalandı","Kaporalandı"],["Satıldı","Satıldı"],["Yayından Kaldırıldı","Yayından Kaldırıldı"]] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</label>
                <select value={form[key as keyof typeof form] as string}
                  onChange={(e) => handleFormChange(key as keyof typeof form, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10">
                  {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </div>
            ))}

            {/* Video URL — full width */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Video URL <span className="normal-case text-gray-300 font-normal">(opsiyonel)</span></label>
              <input type="text" value={form.video_url}
                onChange={(e) => handleFormChange("video_url", e.target.value)}
                placeholder="https://... — SancakTok'ta oynatılır"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>

            {/* Ekspertiz — full width */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Ekspertiz Durumu</label>
              <AdminEkspertizPanel
                value={form.ekspertiz_durumu}
                onChange={(data) => setForm((prev) => ({ ...prev, ekspertiz_durumu: data }))}
              />
            </div>

            {/* Esnaf Notu — full width */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Esnaf Notu <span className="normal-case text-gray-300 font-normal">(opsiyonel)</span></label>
              <textarea rows={2} value={form.esnaf_notu}
                onChange={(e) => handleFormChange("esnaf_notu", e.target.value)}
                placeholder="Araç hakkında özel not..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10" />
            </div>
          </div>

          {/* Alt: vitrin checkbox + kaydet */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-blue-300 transition-colors">
              <input type="checkbox" checked={form.is_featured}
                onChange={(e) => { setForm((prev) => ({ ...prev, is_featured: e.target.checked })); setSaveError(null); }}
                className="h-4 w-4 rounded border-gray-300 accent-blue-500" />
              <span className="text-sm font-semibold text-gray-700 select-none">Vitrine çıkar</span>
              <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </label>

            <div className="flex items-center gap-2">
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              <button type="button" onClick={handleFormToggle}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                İptal
              </button>
              <button type="button" onClick={handleSave}
                disabled={saving || !form.brand.trim() || !form.model.trim() || !form.year.trim() || !form.price.trim() || !form.km.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                {saving && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {saving ? "Kaydediliyor..." : "Aracı Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      <AdminEditDrawer
        car={editingCarId ? (vehicles.find((v) => v.id === editingCarId) ?? null) : null}
        form={editForm}
        saving={editingSaving}
        error={editError}
        addingImage={addingImageId !== null}
        onClose={handleEditCancel}
        onChange={handleEditChange}
        onEkspertizChange={(data) => setEditForm((prev) => ({ ...prev, ekspertiz_durumu: data }))}
        onSave={handleEditSave}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
      />

      {filteredCars.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <svg className="h-9 w-9 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Bu kritere uygun araç bulunamadı.</p>
        </div>
      ) : (
      <>
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedCars.map((car) => (
            <AdminVehicleCard
              key={car.id}
              car={car}
              isUpdating={updatingStatusId === car.id}
              isEditing={editingCarId === car.id}
              updatingFeaturedId={updatingFeaturedId}
              updatingHeroId={updatingHeroId}
              deletingId={deletingId}
              onStatusChange={handleStatusChange}
              onFeaturedToggle={handleFeaturedToggle}
              onHeroToggle={handleHeroToggle}
              onEditClick={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 sm:px-6">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Önceki
            </button>

            <span className="text-[11px] font-mono text-gray-500">
              Sayfa {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </>
      )}
    </div>
  );
}
