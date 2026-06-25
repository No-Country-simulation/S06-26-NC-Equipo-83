import { useEffect, useState, useRef } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import Select, { type SingleValue, type StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { PhoneInput } from "react-international-phone";
import type { PhoneInputRefType } from "react-international-phone";
import "react-international-phone/style.css";
import type { RegisterFormData } from "../../../lib/validations";
import { CONTINENTS } from "../../../lib/continents";
import {
  getCountriesByContinent,
  getStatesByCountry,
  getCitiesByState,
} from "../../../lib/geography";
import type { CountryOption, StateOption, CityOption } from "../../../lib/geography";

// ── Tipos internos ──────────────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
}

// ── Estilos de react-select con colores de marca ───────────────────────

const brandColor = "#99462A";

const selectStyles: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    minHeight: "3.5rem",
    borderRadius: "0.75rem",
    borderColor: "transparent",
    backgroundColor: "#f5f5f4",
    boxShadow: "none",
    "&:hover": { borderColor: "transparent" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(153, 70, 42, 0.1)" : "white",
    color: state.isFocused ? brandColor : "#292524",
    cursor: "pointer",
    fontSize: "0.875rem",
    padding: "0.625rem 0.75rem",
  }),
  singleValue: (base) => ({ ...base, color: "#292524", fontSize: "0.875rem" }),
  placeholder: (base) => ({ ...base, color: "#a8a29e", fontSize: "0.875rem" }),
  menu: (base) => ({ ...base, borderRadius: "0.75rem", marginTop: "0.25rem" }),
  menuList: (base) => ({ ...base, padding: "0.25rem" }),
};

// ── Helpers ────────────────────────────────────────────────────────────

function cvt<T extends CountryOption | StateOption | CityOption>(
  item: T,
): Option {
  if ("code" in item) {
    return { value: item.code, label: item.name };
  }
  return { value: item.name, label: item.name };
}

// ── Componente ─────────────────────────────────────────────────────────

interface RegisterStep2Props {
  form: UseFormReturn<RegisterFormData>;
}

export default function RegisterStep2({ form }: RegisterStep2Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const continentCode = watch("continentCode");
  const countryCode = watch("countryCode");
  const stateCode = watch("stateCode");

  const countries = continentCode ? getCountriesByContinent(continentCode) : [];
  const states = countryCode ? getStatesByCountry(countryCode) : [];

  // ── Teléfono: bandera sincronizada con el país geográfico ────────
  const phoneInputRef = useRef<PhoneInputRefType>(null);

  useEffect(() => {
    if (countryCode) {
      phoneInputRef.current?.setCountry(countryCode.toLowerCase());
    }
  }, [countryCode]);

  // ── Ciudades: carga asíncrona desde GeoNames ──────────────────────
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (countryCode && stateCode) {
      setCitiesLoading(true);
      getCitiesByState(countryCode, stateCode).then((data) => {
        if (!cancelled) {
          setCities(data);
          setCitiesLoading(false);
        }
      });
    } else {
      setCities([]);
      setCitiesLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [countryCode, stateCode]);

  return (
    <div className="space-y-6">
      {/* ── Continente ──────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="continent-select"
          className="block text-sm font-medium text-stone-800 mb-1.5"
        >
            Continente <span className="text-red-500">*</span>
        </label>
        <Controller
          name="continentCode"
          control={control}
          render={({ field }) => (
            <Select<Option, false>
              inputId="continent-select"
              options={CONTINENTS.map((c) => ({ value: c.code, label: c.name }))}
              value={
                field.value
                  ? CONTINENTS.filter((c) => c.code === field.value).map(
                      (c) => ({ value: c.code, label: c.name }),
                    )
                  : null
              }
              onChange={(opt: SingleValue<Option>) => {
                if (opt) {
                  setValue("continentCode", opt.value, { shouldValidate: true });
                  setValue(
                    "continentName",
                    CONTINENTS.find((c) => c.code === opt.value)?.name ?? "",
                  );
                } else {
                  setValue("continentCode", "", { shouldValidate: true });
                  setValue("continentName", "");
                }
                // Cascada: limpiar país, estado, ciudad sin validar
                setValue("countryCode", "", { shouldValidate: false });
                setValue("countryName", "");
                setValue("stateCode", "", { shouldValidate: false });
                setValue("stateName", "");
                setValue("cityName", "", { shouldValidate: false });
              }}
              onBlur={field.onBlur}
              placeholder="Seleccioná un continente"
              styles={selectStyles}
              isClearable
              noOptionsMessage={() => "Sin resultados"}
            />
          )}
        />
        {errors.continentCode && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.continentCode.message}
          </p>
        )}
      </div>

      {/* ── País ────────────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="country-select"
          className="block text-sm font-medium text-stone-800 mb-1.5"
        >
            País <span className="text-red-500">*</span>
        </label>
        <Controller
          name="countryCode"
          control={control}
          render={({ field }) => (
            <Select<Option, false>
              inputId="country-select"
              isDisabled={!continentCode}
              options={countries.map(cvt)}
              value={
                field.value
                  ? countries
                      .filter((c) => c.code === field.value)
                      .map(cvt)
                  : null
              }
              onChange={(opt: SingleValue<Option>) => {
                if (opt) {
                  const country = countries.find((c) => c.code === opt.value);
                  setValue("countryCode", country?.code ?? "", {
                    shouldValidate: true,
                  });
                  setValue("countryName", country?.name ?? "");
                } else {
                  setValue("countryCode", "", { shouldValidate: true });
                  setValue("countryName", "");
                }
                // Cascada: limpiar estado, ciudad sin validar
                setValue("stateCode", "", { shouldValidate: false });
                setValue("stateName", "");
                setValue("cityName", "", { shouldValidate: false });
              }}
              onBlur={field.onBlur}
              placeholder={
                continentCode
                  ? "Seleccioná un país"
                  : "Primero elegí un continente"
              }
              styles={selectStyles}
              isClearable
              noOptionsMessage={() => "Sin resultados"}
            />
          )}
        />
        {errors.countryCode && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.countryCode.message}
          </p>
        )}
      </div>

      {/* ── Provincia/Estado + Ciudad ────────────────────────────────── */}
      <div className="space-y-6">
        {/* Provincia / Estado */}
        <div>
          <label
            htmlFor="state-select"
            className="block text-sm font-medium text-stone-800 mb-1.5"
          >
            Provincia / Estado <span className="text-red-500">*</span>
          </label>
          <Controller
            name="stateCode"
            control={control}
            render={({ field }) => (
              <Select<Option, false>
                inputId="state-select"
                isDisabled={!countryCode}
                options={states.map(cvt)}
                value={
                  field.value
                    ? states
                        .filter((s) => s.code === field.value)
                        .map(cvt)
                    : null
                }
                onChange={(opt: SingleValue<Option>) => {
                  if (opt) {
                    const state = states.find((s) => s.code === opt.value);
                    setValue("stateCode", state?.code ?? "", {
                      shouldValidate: true,
                    });
                    setValue("stateName", state?.name ?? "");
                  } else {
                    setValue("stateCode", "", { shouldValidate: true });
                    setValue("stateName", "");
                  }
                  // Cascada: limpiar ciudad sin validar
                  setValue("cityName", "", { shouldValidate: false });
                }}
                onBlur={field.onBlur}
                placeholder={
                  countryCode
                    ? "Seleccioná una provincia"
                    : "Elegí un país primero"
                }
                styles={selectStyles}
                isClearable
                noOptionsMessage={() => "Sin resultados"}
              />
            )}
          />
          {errors.stateCode && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {errors.stateCode.message}
            </p>
          )}
        </div>

        {/* Ciudad */}
        <div>
          <label
            htmlFor="city-select"
            className="block text-sm font-medium text-stone-800 mb-1.5"
          >
            Ciudad <span className="text-red-500">*</span>
          </label>
          <Controller
            name="cityName"
            control={control}
            render={({ field }) => (
              <CreatableSelect<Option, false>
                inputId="city-select"
                isDisabled={!stateCode}
                isLoading={citiesLoading}
                options={cities.map(cvt)}
                value={
                  field.value
                    ? cities
                        .filter((c) => c.name === field.value)
                        .map(cvt)[0] ?? {
                        value: field.value,
                        label: field.value,
                      }
                    : null
                }
                onChange={(opt: SingleValue<Option>) => {
                  setValue("cityName", opt?.value ?? "", {
                    shouldValidate: true,
                  });
                }}
                onBlur={field.onBlur}
                placeholder={
                  citiesLoading
                    ? "Cargando ciudades..."
                    : stateCode
                      ? "Seleccioná o escribí tu ciudad"
                      : "Elegí una provincia primero"
                }
                styles={selectStyles}
                isClearable
                noOptionsMessage={() =>
                  citiesLoading
                    ? "Cargando..."
                    : "Escribí el nombre de tu ciudad"
                }
                formatCreateLabel={(input) =>
                  `Usar "${input}"`
                }
              />
            )}
          />
          {errors.cityName && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {errors.cityName.message}
            </p>
          )}
        </div>
      </div>

      {/* ── WhatsApp ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-800 mb-1.5">
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <Controller
          name="whatsapp"
          control={control}
          render={({ field }) => (
            <PhoneInput
              ref={phoneInputRef}
              defaultCountry="ar"
              value={field.value}
              onChange={(phone: string) => field.onChange(phone)}
              inputStyle={{
                width: "100%",
                height: "3.5rem",
                borderRadius: "0 0.75rem 0.75rem 0",
                border: "none",
                backgroundColor: "#f5f5f4",
                fontSize: "0.875rem",
              }}
              countrySelectorStyleProps={{
                buttonStyle: {
                  height: "3.5rem",
                  borderRadius: "0.75rem 0 0 0.75rem",
                  border: "none",
                  backgroundColor: "#f5f5f4",
                  paddingLeft: "0.75rem",
                },
                dropdownStyleProps: {
                  style: { borderRadius: "0.75rem" },
                },
              }}
            />
          )}
        />
        {errors.whatsapp && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.whatsapp.message}
          </p>
        )}
        <p className="text-xs text-stone-500 mt-1.5">
          Lo utilizaremos únicamente para notificaciones importantes.
        </p>
      </div>
    </div>
  );
}
