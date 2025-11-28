import { forwardRef } from "react";

const Input = forwardRef(({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon />
          </div>
        )}
        <input
          ref={ref}
          className={"input " + (Icon ? "has-icon " : "") + (error ? "error " : "") + className}
          {...props}
        />
      </div>
      {error && (
        <p className="input-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
