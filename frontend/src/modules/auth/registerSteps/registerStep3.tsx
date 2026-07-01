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

// ── Tipos ───────────────────────────────────────────────────────────────────

interface RegisterStep3Props {
  form: UseFormReturn<RegisterFormData, any, any>;
}

// ── Helpers para KnownTechnology ↔ Option ──────────────────────────────────

function techsToOptions(techs: KnownTechnology[]): Option[] {
  return techs.map((t) => ({ value: t.name, label: t.name }));
}

function optionsToTechs(newOpts: Option[], existing: KnownTechnology[]): KnownTechnology[] {
  const existingMap = new Map(existing.filter((t) => t.is_custom).map((t) => [t.name, t] as const));

  return newOpts.map((opt) => {
    const prev = existingMap.get(opt.value);
    return prev ? prev : { name: opt.value, is_custom: false };
  });
}

function buildTechOptions(selected: KnownTechnology[]): Option[] {
  const predefined = PREDEFINED_TECHNOLOGIES.map((t) => ({ value: t, label: t }));
  const customOpts = selected
    .filter((t) => t.is_custom)
    .filter((t) => !PREDEFINED_TECHNOLOGIES.includes(t.name))
    .map((t) => ({ value: t.name, label: t.name }));
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

  const currentSituation = watch("currentSituation");
  const bio = watch("bio") ?? "";

  return (
    <div className="space-y-6">
      {/* ── Situación actual ──────────────────────────────────────────── */}
      <Controller
        name="currentSituation"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="currentSituation"
            label="Situación actual"
            required
            options={CURRENT_SITUATION_OPTIONS as unknown as Option[]}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      (CURRENT_SITUATION_OPTIONS as unknown as Option[]).find(
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
            error={errors.currentSituation?.message}
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
              label="Sector laboral"
              required
              isCreatable
              options={WORK_SECTORS}
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        WORK_SECTORS.find((s) => s.value === field.value)?.label ??
                        field.value,
                    }
                  : null
              }
              onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
              onCreateOption={(input) => field.onChange(input)}
              error={errors.workSector?.message}
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
              label="Seniority"
              required
              options={SENIORITY_OPTIONS as unknown as Option[]}
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        (SENIORITY_OPTIONS as unknown as Option[]).find(
                          (o) => o.value === field.value,
                        )?.label ?? field.value,
                    }
                  : null
              }
              onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
              error={errors.seniority?.message}
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
            label="Áreas de interés"
            required
            isMulti
            isCreatable
            options={INTEREST_AREAS}
            value={field.value.map((v: string) => ({
              value: v,
              label:
                INTEREST_AREAS.find((a) => a.value === v)?.label ?? v,
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
            noOptionsMessage="Escribí para agregar un área"
            formatCreateLabel={(input) => `Agregar "${input}"`}
            error={errors.interestAreas?.message}
          />
        )}
      />
      <p className="text-xs text-stone-400 -mt-3">
        Seleccioná una o más áreas. Podés escribir para crear una nueva.
      </p>

      {/* ── ¿Qué estás buscando? ──────────────────────────────────────── */}
      <Controller
        name="currentSearch"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            id="currentSearch"
            label="¿Qué estás buscando?"
            required
            options={CURRENT_SEARCH_OPTIONS as unknown as Option[]}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      (CURRENT_SEARCH_OPTIONS as unknown as Option[]).find(
                        (o) => o.value === field.value,
                      )?.label ?? field.value,
                  }
                : null
            }
            onChange={(opt: Option | null) => field.onChange(opt?.value ?? "")}
            error={errors.currentSearch?.message}
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
            label="Tecnologías que conocés"
            isMulti
            isCreatable
            options={buildTechOptions(field.value ?? [])}
            value={techsToOptions(field.value ?? [])}
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
            noOptionsMessage="Escribí para agregar una tecnología"
            formatCreateLabel={(input) => `Agregar "${input}"`}
            isDisabled={false}
            error={errors.knownTechnologies?.message}
          />
        )}
      />
      <p className="text-xs text-stone-400 -mt-3">
        Seleccioná una o más tecnologías. Podés escribir para agregar las tuyas.
      </p>

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-sm font-medium text-stone-800"
        >
          Contanos sobre vos
        </label>
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <textarea
              id="bio"
              className="w-full min-h-[100px] rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400
              focus:outline-none focus:ring-2 focus:ring-[#99462A]/30 focus:border-[#99462A]/40
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none"
              placeholder="Describí brevemente tu experiencia, tus intereses y qué te motiva..."
              maxLength={500}
              {...field}
            />
          )}
        />
        <CharCounter current={bio.length} max={500} />
        {errors.bio && (
          <p className="text-xs text-red-600 font-medium">{errors.bio.message}</p>
        )}
      </div>

      {/* ── Nota ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
        Tus respuestas nos ayudarán a personalizar recomendaciones,
        mentorías y oportunidades acordes a tu perfil profesional.
      </div>
    </div>
  );
}
