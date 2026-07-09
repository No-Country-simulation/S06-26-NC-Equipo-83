import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import i18n from "../../i18n";
import {
  selectStyles,
  selectStylesMulti,
  SELECT_MENU_PROPS,
} from "../../lib/selectStyles";

export interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  options: Option[];
  value: Option | Option[] | null;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  isMulti?: boolean;
  isCreatable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  noOptionsMessage?: string;
  formatCreateLabel?: (inputValue: string) => string;
  onCreateOption?: (inputValue: string) => void;
}

export default function SearchableSelect({
  id, options, value, onChange, onBlur,
  placeholder = i18n.t('common:ui.selectPlaceholder'),
  isMulti = false, isCreatable = false,
  isDisabled = false, isLoading = false,
  error, label, required,
  noOptionsMessage, formatCreateLabel, onCreateOption,
}: SearchableSelectProps) {
  const commonProps = {
    inputId: id,
    ...SELECT_MENU_PROPS,
    options, value, onChange, onBlur, placeholder,
    isDisabled, isLoading,
    isClearable: true,
    noOptionsMessage: () => noOptionsMessage ?? i18n.t('common:ui.selectNoResults'),
    styles: isMulti ? (selectStylesMulti as any) : (selectStyles as any),
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-800">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {isCreatable ? (
        <CreatableSelect
          {...commonProps}
          isMulti={isMulti}
          formatCreateLabel={formatCreateLabel ?? ((input) => i18n.t('common:ui.createLabel', { input }))}
          onCreateOption={onCreateOption}
        />
      ) : (
        <Select {...commonProps} isMulti={isMulti} />
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}