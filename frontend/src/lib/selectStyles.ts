import type { StylesConfig } from "react-select";

const brandColor = "#99462A";

export const SELECT_MENU_PROPS = {
  menuPosition: "fixed" as const,
  maxMenuHeight: 200,
};

export const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
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
  // Estilos para modo multiselect (chips)
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(153, 70, 42, 0.1)",
    borderRadius: "0.5rem",
    margin: "2px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: brandColor,
    fontSize: "0.8125rem",
    padding: "2px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: brandColor,
    borderRadius: "0 0.5rem 0.5rem 0",
    ":hover": {
      backgroundColor: "rgba(153, 70, 42, 0.2)",
      color: "#292524",
    },
  }),
};

// Versión para multiselect (isMulti = true)
export const selectStylesMulti: StylesConfig<{ value: string; label: string }, true> =
  selectStyles as unknown as StylesConfig<{ value: string; label: string }, true>;