import { Badge } from "@/components/ui/Badge";
import styles from "./IssueCard.module.css";

export function IssueCard({
  severity,
  title,
  selector,
  children,
}: {
  severity: "error" | "warning" | "manual" | "passed";
  title: string;
  selector: string;
  children: string;
}) {
  const map = {
    error: ["danger", "Error", "×"],
    warning: ["warning", "Warning", "!"],
    manual: ["info", "Manual review", "?"],
    passed: ["success", "Passed", "✓"],
  } as const;
  const [tone, label, icon] = map[severity];

  return (
    <article className={styles["issue-card"]}>
      <div className={styles["issue-icon"]} aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className={styles["issue-meta"]}>
          <Badge tone={tone}>{label}</Badge>
          <code>{selector}</code>
        </div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}
