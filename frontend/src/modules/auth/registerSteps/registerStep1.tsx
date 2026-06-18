import Input from '../../../components/ui/Input';

interface RegisterStep1Props {
  formData: {
    fullName: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
  };
  updateField: (
    field: string,
    value: string
  ) => void;
}

export default function RegisterStep1({
  formData,
  updateField,
}: RegisterStep1Props) {
  return (
    <div className="space-y-6">
      <Input
        id="fullName"
        label="Nombre completo"
        icon="person"
        placeholder="Ej. Ana García"
        value={formData.fullName}
        onChange={(e) =>
          updateField(
            'fullName',
            e.target.value
          )
        }
      />

      <Input
        id="email"
        type="email"
        label="Correo electrónico"
        icon="mail"
        placeholder="nombre@ejemplo.com"
        value={formData.email}
        onChange={(e) =>
          updateField(
            'email',
            e.target.value
          )
        }
      />

      <Input
        id="password"
        type="password"
        label="Contraseña"
        icon="lock"
        placeholder="Mínimo 8 caracteres"
        value={formData.password}
        onChange={(e) =>
          updateField(
            'password',
            e.target.value
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          id="birthDate"
          type="date"
          label="Fecha de nacimiento"
          icon="calendar_today"
          value={formData.birthDate}
          onChange={(e) =>
            updateField(
              'birthDate',
              e.target.value
            )
          }
        />

        <div className="space-y-2">
          <label
            htmlFor="gender"
            className="text-sm font-medium text-stone-800"
          >
            Género
          </label>

          <select
            id="gender"
            value={formData.gender}
            onChange={(e) =>
              updateField(
                'gender',
                e.target.value
              )
            }
            className="
              h-14
              w-full
              rounded-xl
              border
              border-transparent
              bg-stone-100
              px-4
              text-sm
              focus:border-[#99462A]
              focus:outline-none
              focus:ring-2
              focus:ring-[#99462A]/20
            "
          >
            <option value="">
              Seleccionar
            </option>

            <option value="female">
              Femenino
            </option>

            <option value="male">
              Masculino
            </option>

            <option value="non-binary">
              No binario
            </option>

            <option value="other">
              Otro / Prefiero no decir
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}