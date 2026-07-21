export type ScanIssue = {
  severity: string;
  title: string;
  selector: string;
  message: string;
};

export type ScanReport = {
  errorCount: number;
  warningCount: number;
  issues: ScanIssue[];
};

export type ScanPayload = {
  form_identifier?: string;
  error_count: number;
  warning_count: number;
  passed_count: number;
  results: ScanIssue[];
};

export function buildScanPayload(
  report: ScanReport,
  formIdentifier: string | null | undefined,
  fieldCount: number,
): ScanPayload {
  const error_count = report.errorCount;
  const warning_count = report.warningCount;
  const passed_count = Math.max(0, fieldCount - error_count - warning_count);

  return {
    form_identifier: formIdentifier || undefined,
    error_count,
    warning_count,
    passed_count,
    results: report.issues,
  };
}
