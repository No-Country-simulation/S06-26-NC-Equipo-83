import { Controller, type UseFormReturn } from "react-hook-form";
import type { RegisterFormData } from "../../../lib/validations";
import type { KnownTechnology } from "../../../types/api";
import type { Option } from "../../../components/ui/SearchableSelect";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import CharCounter from "../../../components/ui/CharCounter";
import {
  CURRENT_SITUATION_OPTIONS,
  WORK_SECTORS,
  SENIORITY_OPTIONS,
  INTEREST_AREAS,
  CURRENT_SEARCH_OPTIONS,
  PREDEFINED_TECHNOLOGIES,
} from "../../../lib/registrationData";
import { SKILL_LABELS } from "../../../lib/skillLabels";
import { useTranslation } from "react-i18next";

// ── Tipos ───────────────────────────────────────────────────────────────────

interface RegisterStep3Props {
  form: UseFormReturn<RegisterFormData, any, any>;
}

// ── Helpers para KnownTechnology ↔ Option ──────────────────────────────────

function techsToOptions(techs: KnownTechnology[], getLabel: (key: string) => string): Option[] {
  return techs.map((t) => ({
    value: t.name,
    label: getLabel(t.name),
  }));
}

function optionsToTechs(newOpts: Option[], existing: KnownTechnology[]): KnownTechnology[] {
  const existingMap = new Map(existing.filter((t) => t.is_custom).map((t) => [t.name, t] as const));

  return newOpts.map((opt) => {
    const prev = existingMap.get(opt.value);
    return prev ? prev : { name: opt.value, is_custom: false };
  });
}

function buildTechOptions(selected: KnownTechnology[], getLabel: (key: string) => string): Option[] {
  const predefined = PREDEFINED_TECHNOLOGIES.map((t) => ({
    value: t,
    label: getLabel(t),
  }));
  const customOpts = selected
    .filter((t) => t.is_custom)
    .filter((t) => !PREDEFINED_TECHNOLOGIES.includes(t.name))
    .map((t) => ({ value: t.name, label: t.name })); // custom usa el nombre tal cual
  return [...predefined, ...customOpts];
}

// ── Componente ──────────────────────────────────────────────────────────────

export default function RegisterStep3({ form }: RegisterStep3Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const { t } = useTranslation(['auth', 'common']);

  const getSkillLabel = (key: string) => {
    const raw = SKILL_LABELS[key];
    if (raw && raw.startsWith('__')) {
      return String(t(raw.slice(2)));
    }
    return raw ?? key;
  };

  const translatedSituationOptions = CURRENT_SITUATION_OPTIONS.map((o) => ({ value: o.value, label: String(t(o.labelKey)) }));
  const translatedSeniorityOptions = SENIORITY_OPTIONS.map((o) => ({ value: o.value, label: String(t(o.labelKey)) }));
  const translatedCurrentSearchOptions = CURRENT_SEARCH_OPTIONS.map((o) => ({ value: o.value, label: String(t(o.labelKey)) }));
  const translatedWorkSectors = WORK_SECTORS.map((o) => ({ value: o.value, label: String(t(o.labelKey)) }));
  const translatedInterestAreas = INTEREST_AREAS.map((o) => ({ value: o.value, label: String(t(o.labelKey)) }));

  const currentSituation = watch("currentSituation");
  const bio = watch("bio") ?? "";

  return (
    <div className="space-y-3">
      {/* ── Situación actual ──────────────────────────────────────────── */}
      <Controller
        name="currentSituation"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="currentSituation"
            label={t('auth:step3.currentSituationLabel')}
            required
            options={translatedSituationOptions}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      translatedSituationOptions.find(
                        (o) => o.value === field.value,
                      )?.label ?? field.value,
                  }
                : null
            }
            onChange={(opt: Option | null) => {
              const next = opt?.value ?? "";
              field.onChange(next);
              if (next !== "employed") {
                setValue("workSector", "", { shouldValidate: false });
                setValue("seniority", "", { shouldValidate: false });
              }
            }}
            error={errors.currentSituation?.message ? String(t(errors.currentSituation.message)) : undefined}
          />
        )}
      />

      {/* ── Sector laboral (condicional) ──────────────────────────────── */}
      {currentSituation === "employed" && (
        <Controller
          name="workSector"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="workSector"
              label={t('auth:step3.workSectorLabel')}
              required
              isCreatable
              options={translatedWorkSectors}
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        translatedWorkSectors.find((s) => s.value === field.value)?.label ??
                        field.value,
                    }
                  : null
              }
              onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
              onCreateOption={(input) => field.onChange(input)}
              error={errors.workSector?.message ? String(t(errors.workSector.message)) : undefined}
            />
          )}
        />
      )}

      {/* ── Seniority (condicional) ───────────────────────────────────── */}
      {currentSituation === "employed" && (
        <Controller
          name="seniority"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="seniority"
              label={t('auth:step3.seniorityLabel')}
              required
              options={translatedSeniorityOptions}
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        translatedSeniorityOptions.find(
                          (o) => o.value === field.value,
                        )?.label ?? field.value,
                    }
                  : null
              }
              onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
              error={errors.seniority?.message ? String(t(errors.seniority.message)) : undefined}
            />
          )}
        />
      )}

      {/* ── Áreas de interés ──────────────────────────────────────────── */}
      <Controller
        name="interestAreas"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="interestAreas"
            label={t('auth:step3.interestAreasLabel')}
            required
            isMulti
            isCreatable
            options={translatedInterestAreas}
            value={field.value.map((v: string) => ({
              value: v,
              label:
                translatedInterestAreas.find((a) => a.value === v)?.label ?? v,
            }))}
            onChange={(opts: any) =>
              field.onChange(
                Array.isArray(opts) ? opts.map((o: Option) => o.value) : [],
              )
            }
            onCreateOption={(input: string) => {
              const current: string[] = field.value;
              field.onChange([...current, input]);
            }}
            noOptionsMessage={t('auth:step3.interestAreasNoOptions')}
            formatCreateLabel={(input) => t('auth:step3.interestAreasCreateLabel', { input })}
            error={errors.interestAreas?.message ? String(t(errors.interestAreas.message)) : undefined}
          />
        )}
      />
      <p className="text-xs text-stone-400 -mt-3">
        {t('auth:step3.interestAreasHelp')}
      </p>

      {/* ── ¿Qué estás buscando? ──────────────────────────────────────── */}
      <Controller
        name="currentSearch"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="currentSearch"
            label={t('auth:step3.currentSearchLabel')}
            required
            options={translatedCurrentSearchOptions}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      translatedCurrentSearchOptions.find(
                        (o) => o.value === field.value,
                      )?.label ?? field.value,
                  }
                : null
            }
            onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
            error={errors.currentSearch?.message ? String(t(errors.currentSearch.message)) : undefined}
          />
        )}
      />

      {/* ── Tecnologías conocidas ─────────────────────────────────────── */}
      <Controller
        name="knownTechnologies"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="knownTechnologies"
            label={t('auth:step3.knownTechnologiesLabel')}
            isMulti
            isCreatable
            options={buildTechOptions(field.value ?? [], getSkillLabel)}
            value={techsToOptions(field.value ?? [], getSkillLabel)}
            onChange={(opts: any) => {
              const newOpts: Option[] = Array.isArray(opts) ? opts : [];
              field.onChange(optionsToTechs(newOpts, field.value ?? []));
            }}
            onCreateOption={(input: string) => {
              const current: KnownTechnology[] = field.value ?? [];
              const already = current.find((t) => t.name === input);
              if (already) return;
              field.onChange([...current, { name: input, is_custom: true }]);
            }}
            noOptionsMessage={t('auth:step3.knownTechnologiesNoOptions')}
            formatCreateLabel={(input) => t('auth:step3.knownTechnologiesCreateLabel', { input })}
            isDisabled={false}
            error={errors.knownTechnologies?.message ? String(t(errors.knownTechnologies.message)) : undefined}
          />
        )}
      />
      <p className="text-xs text-stone-400 -mt-3">
        {t('auth:step3.knownTechnologiesHelp')}
      </p>

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-sm font-medium text-stone-800"
        >
          {t('auth:step3.bioLabel')}
        </label>
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <textarea
              id="bio"
              className="w-full min-h-[80px] rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/40
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none"
              placeholder={t('auth:step3.bioPlaceholder')}
              maxLength={500}
              {...field}
            />
          )}
        />
        <CharCounter current={bio.length} max={500} />
        {errors.bio && (
          <p className="text-xs text-red-600 font-medium">{errors.bio?.message ? String(t(errors.bio.message)) : undefined}</p>
        )}
      </div>
    </div>
  );
}
