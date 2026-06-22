"use client";

/* ======================================================================== */
/*  Step3Fiyat - Adim 3: Fiyat Beklentisi                                    */
/*  Musteri kendi satis fiyati beklentisini yazar.                          */
/*  Alim ekibi degerlendirip musteriyi arar (fiyat tahmini verilmez).       */
/* ======================================================================== */

interface Step3FiyatProps {
  fiyatBeklentisi: string;
  takas: boolean;
  ekNot: string;
  onFiyatBeklentisiChange: (val: string) => void;
  onTakasChange: (val: boolean) => void;
  onEkNotChange: (val: string) => void;
  onGeri: () => void;
  onDevam: () => void;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none ring-emerald-500/20 transition-all duration-200 focus:border-emerald-500 focus:ring-2";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

export default function Step3Fiyat({
  fiyatBeklentisi,
  takas,
  ekNot,
  onFiyatBeklentisiChange,
  onTakasChange,
  onEkNotChange,
  onGeri,
  onDevam,
}: Step3FiyatProps) {
  /* Fiyat TL formatında göster: 1250000 → "1.250.000" */
  const formatTL = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const handleFiyatChange = (v: string) => {
    onFiyatBeklentisiChange(v.replace(/[^0-9]/g, ""));
  };
  const displayFiyat = formatTL(fiyatBeklentisi);

  /* Takas icin 3 secenekli local state: "evet" | "hayir" | "duruma-gore" */
  const takasSecenekleri = [
    { deger: "hayir", etiket: "Hayır", aciklama: "Takas düşünmüyorum" },
    { deger: "evet", etiket: "Evet", aciklama: "Takas yapmak istiyorum" },
    { deger: "duruma-gore", etiket: "Duruma Göre", aciklama: "Teklife göre değerlendiririm" },
  ];

  /* Mevcut takas (boolean) -> local string */
  const takasString = takas ? "evet" : "hayir";

  const handleTakasChange = (deger: string) => {
    onTakasChange(deger === "evet");
  };

  return (
    <div className="space-y-5">
      {/* Baslik ve alt metin */}
      <div>
        <h3 className="text-lg font-bold text-[#111827]">Fiyat Beklentisi</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Satış beklentinizi yazın. Alım ekibimiz aracın durumu, piyasa değeri
          ve stok ihtiyacına göre sizinle görüşecektir.
        </p>
      </div>

      {/* Beklenen Satis Fiyati */}
      <div>
        <label htmlFor="step3-fiyat" className={labelClass}>
          Beklenen Satış Fiyatı (TL)
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <input
            id="step3-fiyat"
            type="text"
            inputMode="numeric"
            value={displayFiyat}
            onChange={(e) => handleFiyatChange(e.target.value)}
            placeholder="400.000"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Takas */}
      <div>
        <label className={labelClass}>Takas Düşünüyor musunuz?</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {takasSecenekleri.map((s) => {
            const secili = takasString === s.deger;
            return (
              <button
                key={s.deger}
                type="button"
                onClick={() => handleTakasChange(s.deger)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-4 text-center transition-all duration-200 ${
                  secili
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Ikon */}
                <span className="text-lg">
                  {s.deger === "evet"
                    ? "🔄"
                    : s.deger === "hayir"
                      ? "❌"
                      : "🤔"}
                </span>
                <span className="text-sm font-bold">{s.etiket}</span>
                <span className="text-[10px] leading-tight text-gray-400">
                  {s.aciklama}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ek Not */}
      <div>
        <label htmlFor="step3-eknot" className={labelClass}>
          Ek Not
        </label>
        <textarea
          id="step3-eknot"
          value={ekNot}
          onChange={(e) => onEkNotChange(e.target.value)}
          placeholder="Aracınızla ilgili eklemek istediğiniz özel bir bilgi varsa yazabilirsiniz."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Bilgilendirme karti */}
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
            Bu adım bağlayıcı fiyat oluşturmaz. Nihai değerlendirme Sancaktar
            alım ekibi tarafından yapılır.
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
          onClick={onDevam}
          disabled={fiyatBeklentisi.trim() === ""}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
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
