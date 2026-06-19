import Input from '../../../components/ui/Input';
import Select from "../../../components/ui/Select";

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
          <Select
          id="gender"
          label="Género"
          value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value)}
          options={[
            { value: '', label: 'Seleccionar' },
            { value: 'female', label: 'Femenino' },
            { value: 'male', label: 'Masculino' },
            { value: 'non-binary', label: 'No binario' },
            { value: 'other', label: 'Otro / Prefiero no decir' },
          ]}
        />
        </div>
      </div>
    </div>
  );
}