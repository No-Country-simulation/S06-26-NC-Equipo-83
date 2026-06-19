import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

interface RegisterStep2Props {
  formData: {
    continent: string;
    country: string;
    state: string;
    city: string;
    phoneCode: string;
    whatsapp: string;
  };
  updateField: (
    field: string,
    value: string
  ) => void;
}

export default function RegisterStep2({
  formData,
  updateField,
}: RegisterStep2Props) {
  return (
    <div className="space-y-6">
      {/* Continente */}
      <div className="space-y-2">
        <Select
        id="continent"
        label="Continente"
        value={formData.continent}
        onChange={(e) => updateField("continent", e.target.value)}
        options={[
          { value: "", label: "Selecciona un continente" },
          { value: "america", label: "América" },
          { value: "europe", label: "Europa" },
          { value: "asia", label: "Asia" },
          { value: "africa", label: "África" },
          { value: "oceania", label: "Oceanía" },
        ]}
      />
      </div>

      {/* País */}
      <div className="space-y-2">
        <Select
        id="country"
        label="País"
        value={formData.country}
        onChange={(e) => updateField("country", e.target.value)}
        options={[
          { value: "", label: "Selecciona un país" },
          { value: "ar", label: "Argentina" },
          { value: "uy", label: "Uruguay" },
          { value: "cl", label: "Chile" },
          { value: "co", label: "Colombia" },
          { value: "mx", label: "México" },
          { value: "es", label: "España" },
        ]}
      />
      </div>

      {/* Provincia / Ciudad */}
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          id="state"
          label="Provincia / Estado"
          placeholder="Ej. Buenos Aires"
          value={formData.state}
          onChange={(e) =>
            updateField("state", e.target.value)
          }
        />

        <Input
          id="city"
          label="Ciudad"
          placeholder="Ej. La Plata"
          value={formData.city}
          onChange={(e) =>
            updateField("city", e.target.value)
          }
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <label htmlFor="whatsapp" className="text-sm font-medium text-stone-800">
          WhatsApp
        </label>

        <div className="flex gap-3">
          <select
            value={formData.phoneCode}
            onChange={(e) =>
              updateField("phoneCode", e.target.value)
            }
            className="h-14 w-28 rounded-xl bg-stone-100 px-3 focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          >
            <option value="+54">+54</option>
            <option value="+34">+34</option>
            <option value="+52">+52</option>
            <option value="+57">+57</option>
          </select>

          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) =>
              updateField("whatsapp", e.target.value)
            }
            placeholder="Número de teléfono"
            className="h-14 flex-1 rounded-xl bg-stone-100 px-4 focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          />
        </div>

        <p className="text-xs text-stone-500">
          Lo utilizaremos únicamente para notificaciones importantes.
        </p>
      </div>
    </div>
  );
}