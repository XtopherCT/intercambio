import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={"select " + className}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select-icon">
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}
