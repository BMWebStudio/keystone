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

export type ProjectConfig = Record<string, unknown>;

export type ValidatorConfig = ProjectConfig & {
  validationMode: string[];
};

export type Validator = {
  config: ValidatorConfig;
  init(root?: ParentNode): Validator;
  listForms(root?: ParentNode): TrackedForm[];
  scan(root?: ParentNode): ScanReport;
  validateField(field: HTMLElement): string | null;
  validateForm(form: HTMLFormElement): Array<{ field: HTMLElement; text: string }>;
};

export function createValidator(options?: ProjectConfig): Validator;

export function fetchProjectConfig(
  projectKey: string,
  configUrl?: string,
): Promise<ProjectConfig>;

export function autoInit(options?: Record<string, unknown>): Promise<unknown>;

export function saveScanReport(
  projectKey: string,
  report: ScanReport,
  options?: Record<string, unknown>,
): Promise<unknown>;

export function scanDocument(root?: ParentNode): ScanIssue[];
export function summarizeScan(issues: ScanIssue[]): ScanReport;
