"use client";

import { useState } from "react";

/* ======================================================================== */
/*  Step2DurumBilgileri - Adim 2: Arac Durumu                               */
/*  Premium form: km, hasar, tramer, boya, degisen parca,                   */
/*  tramer tutari, calisir durumda, rehin/haciz/kredi, fotoğraflar          */
/* ======================================================================== */

interface Step2DurumBilgileriProps {
  km: string;
  hasar: string;
  tramer: boolean;
  photoUrls: string[];
  uploadingPhotos: boolean;
  photoError: string | null;
  onKmChange: (val: string) => void;
  onHasarChange: (val: string) => void;
  onTramerChange: (val: boolean) => void;
  onPhotoUpload: (files: FileList | null) => void;
  onRemovePhoto: (url: string) => void;
  onGeri: () => void;
  onDevam: () => void;
}

const hasarSecenekleri = ["Hasarsız", "Boyalı", "Değişen Parça", "Ağır Hasar"];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none ring-emerald-500/20 transition-all duration-200 focus:border-emerald-500 focus:ring-2";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

export default function Step2DurumBilgileri({
  km,
  hasar,
  tramer,
  photoUrls,
  uploadingPhotos,
  photoError,
  onKmChange,
  onHasarChange,
  onTramerChange,
  onPhotoUpload,
  onRemovePhoto,
  onGeri,
  onDevam,
}: Step2DurumBilgileriProps) {
  const [boyaDurumu, setBoyaDurumu] = useState("");
  const [degisenParca, setDegisenParca] = useState("");
  const [tramerTutari, setTramerTutari] = useState("");
const [rehinHacizKredi, setRehinHacizKredi] = useState("");

  const boyaSecenekleri = ["Orijinal", "Yerel Boya", "Tam Boya", "Bilmiyorum"];
  const degisenSecenekleri = ["Yok", "Ön", "Arka", "Sağ", "Sol", "Birden Fazla"];
  const rehinSecenekleri = ["Yok", "Rehin", "Haciz", "Kredi Borcu", "Birden Fazla"];

  return (
    <div className="space-y-5">
      {/* Baslik ve alt metin */}
      <div>
        <h3 className="text-lg font-bold text-[#111827]">Araç Durumu</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Aracınızın boya, değişen, tramer ve genel durum bilgilerini
          paylaşın. Alım ekibimiz ön değerlendirme sonrası sizinle iletişime
          geçecektir.
        </p>
      </div>

      {/* Iki kolonlu grid - mobilde tek, desktopta iki */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        {/* Kilometre */}
        <div>
          <label htmlFor="step2-km" className={labelClass}>
            Kilometre
          </label>
          <input
            id="step2-km"
            type="text"
            inputMode="numeric"
            value={km}
            onChange={(e) => onKmChange(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Örn: 120.000"
            className={inputClass}
          />
        </div>

        {/* Boya Durumu */}
        <div>
          <label className={labelClass}>Boya Durumu</label>
          <div className="flex flex-wrap gap-1.5">
            {boyaSecenekleri.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBoyaDurumu(boyaDurumu === b ? "" : b)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  boyaDurumu === b
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Hasar Aciklamasi - textarea, tam genislik */}
        <div className="md:col-span-2">
          <label htmlFor="step2-hasar" className={labelClass}>
            Hasar Açıklaması
          </label>
          <textarea
            id="step2-hasar"
            value={hasar}
            onChange={(e) => onHasarChange(e.target.value)}
            placeholder="Varsa mevcut hasar kayıtlarını, geçmiş kazaları veya dikkat edilmesi gereken noktaları açıklayın..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Degisen Parca */}
        <div>
          <label className={labelClass}>Değişen Parça</label>
          <div className="flex flex-wrap gap-1.5">
            {degisenSecenekleri.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDegisenParca(degisenParca === d ? "" : d)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  degisenParca === d
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>


        {/* Tramer - modern kart */}
        <div className="md:col-span-2">
          <label className={labelClass}>Tramer Kaydı</label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onTramerChange(false)}
              className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-medium transition-all duration-200 ${
                !tramer
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  !tramer
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}
              >
                {!tramer && (
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span>Tramer Kaydı Yok</span>
            </button>
            <button
              type="button"
              onClick={() => onTramerChange(true)}
              className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-medium transition-all duration-200 ${
                tramer
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  tramer
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}
              >
                {tramer && (
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span>Tramer Kaydı Var</span>
            </button>
          </div>

          {/* Tramer tutari - sadece tramer varsa */}
          {tramer && (
            <div className="mt-3">
              <input
                type="text"
                inputMode="numeric"
                value={tramerTutari}
                onChange={(e) =>
                  setTramerTutari(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Tramer tutarı (TL)"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Rehin / Haciz / Kredi */}
        <div className="md:col-span-2">
          <label className={labelClass}>Rehin / Haciz / Kredi Durumu</label>
          <div className="flex flex-wrap gap-1.5">
            {rehinSecenekleri.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setRehinHacizKredi(rehinHacizKredi === r ? "" : r)
                }
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  rehinHacizKredi === r
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/*  Arac Fotograflari                                                  */}
      {/* ================================================================== */}
      <div>
        <label className={labelClass}>Araç Fotoğrafları</label>
        <p className="mb-3 text-xs text-gray-400">
          Aracınızın ön, arka, yan ve iç kısımlarını gösteren en fazla 5 adet fotoğraf ekleyin.
        </p>

        {/* Onizleme alani */}
        {photoUrls.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photoUrls.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={url}
                  alt="Araç fotoğrafı"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                  aria-label="Fotoğrafı kaldır"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Yükleme alani */}
        {photoUrls.length < 5 && (
          <label
            className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-all ${
              uploadingPhotos
                ? "border-gray-200 bg-gray-50 text-gray-400"
                : "border-gray-300 bg-gray-50/50 text-gray-500 hover:border-emerald-400 hover:bg-emerald-50/30 hover:text-emerald-600"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploadingPhotos}
              onChange={(e) => onPhotoUpload(e.target.files)}
            />
            {uploadingPhotos ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Fotoğraflar yükleniyor...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Fotoğraf Yükle (en fazla 5)</span>
              </>
            )}
          </label>
        )}

        {/* Hata mesaji */}
        {photoError && (
          <p className="mt-2 text-xs font-medium text-red-500">{photoError}</p>
        )}

        {/* Yükleme sayaci */}
        <p className="mt-1.5 text-[10px] text-gray-400">
          {photoUrls.length} / 5 fotoğraf yüklendi
        </p>
      </div>

      {/* Bilgi notu */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-xs leading-relaxed text-emerald-800">
            Bu bilgiler bağlayıcı fiyat oluşturmaz. Nihai değerlendirme alım
            ekibi tarafından yapılır.
          </p>
        </div>
      </div>

      {/* Geri / Devam */}
      <div className="flex justify-between pt-1">
        <button
          type="button"
          onClick={onGeri}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.97]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Geri
        </button>
        <button
          type="button"
          disabled={!km}
          onClick={onDevam}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-700/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100"
        >
          Devam
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
