"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import formFieldStyles from "@/components/forms/FormField.module.css";
import styles from "@/app/dashboard/playground/playground.module.css";

type ChildProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
};

export function PlaygroundFormField({
  id,
  label,
  description,
  isRequired,
  onRequiredChange,
  alwaysRequired = false,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  isRequired: boolean;
  onRequiredChange?: (required: boolean) => void;
  alwaysRequired?: boolean;
  children: ReactNode;
}) {
  const required = alwaysRequired || isRequired;
  const descriptionId = description ? `${id}-description` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<ChildProps>, {
        id,
        required: required || undefined,
        "aria-describedby": descriptionId,
      })
    : children;

  return (
    <div className={formFieldStyles["form-field"]}>
      {alwaysRequired ? (
        <label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}{" "}
          {required && <span className="sr-only">required</span>}
        </label>
      ) : (
        <div className={styles["field-label-row"]}>
          <label htmlFor={id}>
            {label}
            {required && <span aria-hidden="true"> *</span>}{" "}
            {required && <span className="sr-only">required</span>}
          </label>
          {onRequiredChange && (
            <span className={styles["required-toggle"]}>
              <input
                id={`${id}-required`}
                type="checkbox"
                checked={isRequired}
                onChange={(event) => onRequiredChange(event.target.checked)}
              />
              <label htmlFor={`${id}-required`}>Required</label>
            </span>
          )}
        </div>
      )}
      {description && (
        <p id={descriptionId} className={formFieldStyles["field-description"]}>
          {description}
        </p>
      )}
      {control}
    </div>
  );
}
