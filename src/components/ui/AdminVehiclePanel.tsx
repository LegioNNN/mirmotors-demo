"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Car } from "@/types";
import AdminVehicleCard from "./AdminVehicleCard";
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
  image_url: "",
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>(defaultForm);
  const [editingSaving, setEditingSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
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
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Fotoğraf yüklenirken hata oluştu.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditFileUpload = async (carId: string, file: File) => {
    // 3. Araç ID kontrolü
    if (!carId) {
      const msg = "Araç ID bulunamadı, fotoğraf kaydedilemedi.";
      setUploadError(msg);
      console.error("[handleEditFileUpload] carId yok");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const publicUrl = await uploadCarImage(file);

      // 4. publicUrl boş kontrolü
      if (!publicUrl) {
        const msg = "Fotoğraf URL'i oluşturulamadı.";
        setUploadError(msg);
        console.error("[handleEditFileUpload] publicUrl boş", { carId });
        return;
      }

      // 5. Kesin imzalı Supabase update + select
      const { data, error: updateErr } = await supabase
        .from("cars")
        .update({
          images: [publicUrl],
          updated_at: new Date().toISOString(),
        })
        .eq("id", carId)
        .select("id, brand, model, images, updated_at")
        .single();

      // 9. Debug log
      if (updateErr) {
        console.error("[handleEditFileUpload] Supabase update hatası", { carId, publicUrl, error: updateErr });
      }

      // 6. Update sonrası data.images doğrulaması
      if (updateErr) {
        setUploadError("Fotoğraf yüklendi ama araç kaydına işlenemedi: " + updateErr.message);
        return;
      }

      if (!data) {
        console.error("[handleEditFileUpload] data yok", { carId, publicUrl });
        setUploadError("Fotoğraf yüklendi ama veritabanına kaydedilemedi.");
        return;
      }

      if (!data.images || data.images.length === 0) {
        console.error("[handleEditFileUpload] data.images boş", { carId, publicUrl, data });
        setUploadError("Fotoğraf yüklendi ama veritabanına kaydedilemedi.");
        return;
      }

      // Sadece data.images[0] publicUrl ile eşleşiyorsa başarılı
      if (data.images[0] !== publicUrl) {
        console.error("[handleEditFileUpload] images[0] publicUrl ile eşleşmiyor", { carId, publicUrl, dataImages: data.images });
        setUploadError("Fotoğraf yüklendi ama veritabanına kaydedilemedi.");
        return;
      }

      // 7. Başarılı → local vehicles state'i güncelle
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === carId ? { ...vehicle, ...data } : vehicle
        )
      );

      // 8. Aynı araç düzenleniyorsa editForm.image_url güncelle
      if (editingCarId === carId) {
        setEditForm((prev) => ({ ...prev, image_url: publicUrl }));
      }

      // 6 sonu: sadece veritabanına gerçekten yazıldıysa başarılı
      setUploadSuccess("Fotoğraf yüklendi ve araca kaydedildi.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fotoğraf yüklenirken hata oluştu.";
      setUploadError(msg);
      console.error("[handleEditFileUpload] catch", { carId, error: err });
    } finally {
      setUploadingImage(false);
      setTimeout(() => setUploadSuccess(null), 4000);
    }
  };

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim() || !form.price.trim()) {
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

    const images: string[] = form.image_url.trim() ? [form.image_url.trim()] : [];

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
      images,
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
    image_url: (car.images?.length ?? 0) > 0 ? car.images[0] : "",
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

    // images alanını koru: form'da image_url varsa kullan, yoksa mevcut images'i koru
    const images: string[] = editForm.image_url.trim()
      ? [editForm.image_url.trim()]
      : (vehicles.find((v) => v.id === carId)?.images ?? []);

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
      images,
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
              images,
              fuel_type: payload.fuel_type as Car["fuel_type"],
              transmission: payload.transmission as Car["transmission"],
              segment: payload.segment as Car["segment"],
              status: payload.status as Car["status"],
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 sm:px-6">
        <h2 className="text-sm font-bold text-[#111827]">Stoktaki Araçlar</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFormToggle}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition-all ${
              formOpen
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-[#111827] text-white hover:bg-gray-800"
            }`}
          >
            {formOpen ? (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Kapat
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Yeni Araç Ekle
              </>
            )}
          </button>
          <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-mono text-gray-500 border border-gray-100">
            {vehicles.length}
          </span>
        </div>
      </div>

      {/* Arama + Filtre Alanı */}
      <div className="border-b border-gray-100 px-5 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Arama inputu */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Marka veya model ara..."
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-[11px] text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
            />
          </div>
          {/* Status filtre butonları */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["Tümü", "Aktif", "Kaporalandı", "Satıldı", "Yayından Kaldırıldı"] as const).map((s) => {
              const count = s === "Tümü" ? vehicles.length : vehicles.filter((c) => c.status === s).length;
              const isActive = s === "Tümü" ? !statusFilter : statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s === "Tümü" ? null : s)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                    isActive
                      ? "bg-[#111827] text-white shadow-sm"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {s}
                  <span className={`${isActive ? "text-gray-300" : "text-gray-400"} font-mono`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Alanı */}
      {formOpen && (
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Marka */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Marka <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => handleFormChange("brand", e.target.value)}
                placeholder="Örn: BMW"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
              />
            </div>
            {/* Model */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Model <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => handleFormChange("model", e.target.value)}
                placeholder="Örn: 320i M Sport"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
              />
            </div>
            {/* Yıl */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Yıl</label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => handleFormChange("year", e.target.value)}
                placeholder="Örn: 2022"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
              />
            </div>
            {/* Fiyat */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Fiyat (₺) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                placeholder="Örn: 2850000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
              />
            </div>
            {/* KM */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">KM</label>
              <input
                type="text"
                value={form.km}
                onChange={(e) => handleFormChange("km", e.target.value)}
                placeholder="Örn: 22000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-gray-300 focus:border-[#111827]"
              />
            </div>
            {/* Fotoğraf Yükle */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Fotoğraf Yükle</label>
              <div className="flex items-center gap-2">
                <label className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700 ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  {uploadingImage ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Yükle
                    </>
                  )}
                </label>
                {uploadingImage && (
                  <span className="text-[10px] text-emerald-600 font-medium">Fotoğraf yükleniyor...</span>
                )}
                {!uploadingImage && form.image_url && (
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Görsel seçildi</span>
                )}
              </div>
              {uploadSuccess && (
                <p className="mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">{uploadSuccess}</p>
              )}
              {uploadError && (
                <p className="mt-1 text-[10px] font-medium text-red-500">{uploadError}</p>
              )}
            </div>
            {/* Yakıt */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Yakıt</label>
              <select
                value={form.fuel_type}
                onChange={(e) => handleFormChange("fuel_type", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#111827]"
              >
                <option value="Benzin">Benzin</option>
                <option value="Dizel">Dizel</option>
                <option value="Elektrik">Elektrik</option>
                <option value="Hibrit">Hibrit</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
            {/* Vites */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Vites</label>
              <select
                value={form.transmission}
                onChange={(e) => handleFormChange("transmission", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#111827]"
              >
                <option value="Otomatik">Otomatik</option>
                <option value="Manuel">Manuel</option>
                <option value="Yarı Otomatik">Yarı Otomatik</option>
              </select>
            </div>
            {/* Segment */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Segment</label>
              <select
                value={form.segment}
                onChange={(e) => handleFormChange("segment", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#111827]"
              >
                <option value="Kelepir">Fırsat</option>
                <option value="Orta Direk">Orta Segment</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            {/* Durum */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Durum</label>
              <select
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#111827]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Kaporalandı">Kaporalandı</option>
                <option value="Satıldı">Satıldı</option>
                <option value="Yayından Kaldırıldı">Yayından Kaldırıldı</option>
              </select>
            </div>
            {/* Vitrinde Öne Çıkar */}
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, is_featured: e.target.checked }));
                    setSaveError(null);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-amber-500 accent-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] font-medium text-gray-600 select-none">Vitrinde öne çıkar</span>
              </label>
            </div>
          </div>

          {/* Hata mesajı */}
          {saveError && (
            <p className="mt-3 text-xs font-medium text-red-500">{saveError}</p>
          )}

          {/* Kaydet butonu */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.brand.trim() || !form.model.trim() || !form.price.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedCars.map((car) => (
            <AdminVehicleCard
              key={car.id}
              car={car}
              isUpdating={updatingStatusId === car.id}
              isEditing={editingCarId === car.id}
              updatingFeaturedId={updatingFeaturedId}
              updatingHeroId={updatingHeroId}
              editForm={editingCarId === car.id ? editForm : defaultForm}
              editError={editError}
              editingSaving={editingSaving}
              uploadingImage={uploadingImage}
              uploadSuccess={uploadSuccess}
              onStatusChange={handleStatusChange}
              onFeaturedToggle={handleFeaturedToggle}
              onHeroToggle={handleHeroToggle}
              onEditClick={handleEditClick}
              onEditCancel={handleEditCancel}
              onEditChange={handleEditChange}
              onEditSave={handleEditSave}
              onFileUpload={handleEditFileUpload}
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
