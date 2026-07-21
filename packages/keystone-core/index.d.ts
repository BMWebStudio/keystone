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

export type TrackedForm = {
  index: number;
  id: string | null;
  name: string | null;
  action: string | null;
  method: string;
  fieldCount: number;
  identifier: string;
};

export function createValidator(options?: Record<string, unknown>): {
  init(root?: ParentNode): unknown;
  listForms(root?: ParentNode): TrackedForm[];
  scan(root?: ParentNode): ScanReport;
};

export function scanDocument(root?: ParentNode): ScanIssue[];
export function summarizeScan(issues: ScanIssue[]): ScanReport;
