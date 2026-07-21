import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./FormField.module.css";

type ChildProps = {
  id?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<ChildProps>, {
        id,
        required: required || undefined,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={styles["form-field"]}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}{" "}
        {required && <span className="sr-only">required</span>}
      </label>
      {description && (
        <p id={descriptionId} className={styles["field-description"]}>
          {description}
        </p>
      )}
      {control}
      {error && (
        <p id={errorId} className={styles["field-error"]}>
          <span aria-hidden="true">×</span> {error}
        </p>
      )}
    </div>
  );
}
