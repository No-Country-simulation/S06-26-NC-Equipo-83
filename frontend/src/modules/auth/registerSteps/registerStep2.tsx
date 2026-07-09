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
import { useTranslation } from "react-i18next";

// ── Tipos internos ──────────────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
}

// ── Estilos de react-select con colores de marca ───────────────────────

const brandColor = "#2F75DC";
const SELECT_MENU_PROPS = {
  menuPosition: "fixed" as const,
  maxMenuHeight: 200,
};

const selectStyles: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    minHeight: "3.5rem",
    borderRadius: "0.75rem",
    borderColor: "transparent",
    backgroundColor: "#f1f5f9",
    boxShadow: "none",
    "&:hover": { borderColor: "transparent" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(47,117,220,0.1)" : "white",
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
  form: UseFormReturn<RegisterFormData, any, any>;
}

export default function RegisterStep2({ form }: RegisterStep2Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const { t } = useTranslation(['auth', 'common']);

  const continentCode = watch("continentCode");
  const countryCode = watch("countryCode");
  const stateCode = watch("stateCode");

  const countries = continentCode ? getCountriesByContinent(continentCode) : [];
  const states = countryCode ? getStatesByCountry(countryCode) : [];

  // ── Teléfono: sincronizar bandera con país ──────────────────────
  const phoneInputRef = useRef<PhoneInputRefType>(null);
  const initialCountryRef = useRef(countryCode);

  useEffect(() => {
    if (!countryCode || countryCode === initialCountryRef.current) return;
    initialCountryRef.current = countryCode;
    phoneInputRef.current?.setCountry(countryCode.toLowerCase());
  }, [countryCode]);

  // ── Ciudad: debounce del filtro para no filtrar en cada tecla ────
  const [citySearch, setCitySearch] = useState("");
  const cityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(cityTimer.current);
  }, []);

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
      <div className="space-y-3">
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
                {...SELECT_MENU_PROPS}
                options={CONTINENTS.map((c) => ({ value: c.code, label: String(t(c.labelKey)) }))}
                value={
                field.value
                  ? CONTINENTS.filter((c) => c.code === field.value).map(
                      (c) => ({ value: c.code, label: String(t(c.labelKey)) }),
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
              placeholder={t('auth:step2.continentPlaceholder')}
              styles={selectStyles}
              isClearable
              noOptionsMessage={() => String(t('auth:step2.continentNoResults'))}
            />
          )}
        />
        {errors.continentCode && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.continentCode.message ? String(t(errors.continentCode.message)) : undefined}
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
                {...SELECT_MENU_PROPS}
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
                  ? String(t('auth:step2.countryPlaceholder'))
                  : String(t('auth:step2.countryDisabledPlaceholder'))
              }
              styles={selectStyles}
              isClearable
              noOptionsMessage={() => String(t('auth:step2.countryNoResults'))}
            />
          )}
        />
        {errors.countryCode && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.countryCode.message ? String(t(errors.countryCode.message)) : undefined}
          </p>
        )}
      </div>

      {/* ── Provincia/Estado + Ciudad ────────────────────────────────── */}
    <div className="space-y-3">
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
                {...SELECT_MENU_PROPS}
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
                    ? String(t('auth:step2.statePlaceholder'))
                    : String(t('auth:step2.stateDisabledPlaceholder'))
                }
                styles={selectStyles}
                isClearable
                noOptionsMessage={() => String(t('auth:step2.stateNoResults'))}
              />
            )}
          />
          {errors.stateCode && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {errors.stateCode.message ? String(t(errors.stateCode.message)) : undefined}
            </p>
          )}
        </div>

        {/* Ciudad */}
        <div>
          <label
            htmlFor="city-select"
            className="block text-sm font-medium text-stone-800 mb-1.5"
          >
            {t('auth:step2.cityLabel')} <span className="text-red-500">*</span>
          </label>
          <Controller
            name="cityName"
            control={control}
            render={({ field }) => (
              <CreatableSelect<Option, false>
                inputId="city-select"
                {...SELECT_MENU_PROPS}
                isDisabled={!stateCode}
                isLoading={citiesLoading}
                options={cities.map(cvt)}
                filterOption={(option) => {
                  if (citySearch.length < 2) return false;
                  return option.label.toLowerCase().includes(citySearch);
                }}
                onInputChange={(val, { action }) => {
                  if (action === "input-change") {
                    clearTimeout(cityTimer.current);
                    cityTimer.current = setTimeout(
                      () => setCitySearch(val.toLowerCase()),
                      300,
                    );
                  }
                  return val;
                }}
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
                    ? String(t('auth:step2.cityLoading'))
                    : stateCode
                      ? String(t('auth:step2.cityPlaceholder'))
                      : String(t('auth:step2.cityDisabledPlaceholder'))
                }
                styles={selectStyles}
                isClearable
                noOptionsMessage={() =>
                  citiesLoading
                    ? String(t('auth:step2.cityLoadingNoOptions'))
                    : String(t('auth:step2.cityNoResults'))
                }
                formatCreateLabel={(input) =>
                  t('auth:step2.cityCreateLabel', { input })
                }
              />
            )}
          />
          {errors.cityName && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {errors.cityName.message ? String(t(errors.cityName.message)) : undefined}
            </p>
          )}
        </div>
      </div>

      {/* ── WhatsApp ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-800 mb-1.5">
          {t('auth:step2.whatsappLabel')} <span className="text-red-500">*</span>
        </label>
        <Controller
          name="whatsapp"
          control={control}
          render={({ field }) => (
            <PhoneInput
              ref={phoneInputRef}
              defaultCountry={countryCode?.toLowerCase() || "ar"}
              value={field.value}
              onChange={(phone: string) => field.onChange(phone)}
              inputStyle={{
                width: "100%",
                height: "3.5rem",
                borderRadius: "0 0.75rem 0.75rem 0",
                border: "none",
                backgroundColor: "#f1f5f9",
                fontSize: "0.875rem",
              }}
              countrySelectorStyleProps={{
                buttonStyle: {
                  height: "3.5rem",
                  borderRadius: "0.75rem 0 0 0.75rem",
                  border: "none",
                  backgroundColor: "#f1f5f9",
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
            {errors.whatsapp.message ? String(t(errors.whatsapp.message)) : undefined}
          </p>
        )}
      </div>
    </div>
  );
}
