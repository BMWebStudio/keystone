import { Card, CardContent } from "@/components/ui/Card";
import styles from "./MetricCard.module.css";

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className={styles["metric-card"]}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{detail}</small>
        </div>
      </CardContent>
    </Card>
  );
}
