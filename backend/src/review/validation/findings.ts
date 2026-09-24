import { z } from "zod";
import { Finding, ParsedDiff, FileDiff } from "../../types";
import { env } from "../../config";

export const FindingSchema = z.object({
  file: z.string().min(1),
  line: z.number().int().positive().optional(),
  side: z.enum(["LEFT", "RIGHT"]).optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  category: z.enum(["BUG", "SECURITY", "PERFORMANCE", "RELIABILITY", "MAINTAINABILITY"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  recommendation: z.string().max(1000).optional(),
  confidence: z.number().min(0).max(1),
});

export type ValidatedFinding = z.infer<typeof FindingSchema>;

export interface ValidationResult {
  valid: ValidatedFinding[];
  rejected: Array<{ finding: Finding; reason: string }>;
}

export function validateFindingSchema(finding: Finding): { success: boolean; data?: ValidatedFinding; error?: string } {
  const result = FindingSchema.safeParse(finding);
  if (!result.success) {
    return { success: false, error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ") };
  }
  return { success: true, data: result.data };
}

export function validateFindingLocation(finding: ValidatedFinding, diff: ParsedDiff): { valid: boolean; reason?: string } {
  const fileDiff = diff.files.find((f) => f.file === finding.file);
  if (!fileDiff) {
    return { valid: false, reason: `File ${finding.file} not found in diff` };
  }

  if (finding.line !== undefined) {
    let lineExists = false;
    let lineInDiff = false;

    for (const hunk of fileDiff.hunks) {
      for (const line of hunk.lines) {
        const lineNum = finding.side === "LEFT" ? line.oldLine : line.newLine ?? line.oldLine;
        if (lineNum === finding.line) {
          lineExists = true;
          if (line.type !== "context") {
            lineInDiff = true;
          }
        }
      }
    }

    if (!lineExists) {
      return { valid: false, reason: `Line ${finding.line} does not exist in file ${finding.file}` };
    }

    if (!lineInDiff && finding.severity === "CRITICAL") {
      return { valid: false, reason: `Line ${finding.line} is not a changed line in ${finding.file}; critical findings must be on changed lines` };
    }
  }

  return { valid: true };
}

export function validateFindingConfidence(finding: ValidatedFinding): { valid: boolean; reason?: string } {
  const minConfidence = env.DIFFMIND_MIN_CONFIDENCE;
  if (finding.confidence < minConfidence) {
    return { valid: false, reason: `Confidence ${finding.confidence} below minimum ${minConfidence}` };
  }
  return { valid: true };
}

export function validateFinding(finding: Finding, diff: ParsedDiff): { valid: boolean; data?: ValidatedFinding; reason?: string } {
  const schemaResult = validateFindingSchema(finding);
  if (!schemaResult.success) {
    return { valid: false, reason: schemaResult.error };
  }

  const locationResult = validateFindingLocation(schemaResult.data!, diff);
  if (!locationResult.valid) {
    return { valid: false, reason: locationResult.reason };
  }

  const confidenceResult = validateFindingConfidence(schemaResult.data!);
  if (!confidenceResult.valid) {
    return { valid: false, reason: confidenceResult.reason };
  }

  return { valid: true, data: schemaResult.data };
}

export function deduplicateFindings(findings: ValidatedFinding[]): ValidatedFinding[] {
  const seen = new Map<string, ValidatedFinding>();

  for (const finding of findings) {
    const key = `${finding.file}:${finding.line ?? 0}:${finding.severity}:${finding.category}:${finding.title}`;

    const existing = seen.get(key);
    if (!existing || finding.confidence > existing.confidence) {
      seen.set(key, finding);
    }
  }

  return Array.from(seen.values());
}

export function limitFindings(findings: ValidatedFinding[], max: number = env.DIFFMIND_MAX_FINDINGS): ValidatedFinding[] {
  return findings
    .sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (severityOrder[b.severity] !== severityOrder[a.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.confidence - a.confidence;
    })
    .slice(0, max);
}

export function validateAndProcessFindings(findings: Finding[], diff: ParsedDiff): ValidationResult {
  const validated: ValidatedFinding[] = [];
  const rejected: Array<{ finding: Finding; reason: string }> = [];

  for (const finding of findings) {
    const result = validateFinding(finding, diff);
    if (result.valid && result.data) {
      validated.push(result.data);
    } else {
      rejected.push({ finding, reason: result.reason ?? "Unknown validation error" });
    }
  }

  const deduplicated = deduplicateFindings(validated);
  const limited = limitFindings(deduplicated);

  const finalRejected = [
    ...rejected,
    ...validated.filter((f) => !limited.includes(f)).map((f) => ({ finding: f, reason: "Exceeded max findings limit" })),
  ];

  return {
    valid: limited,
    rejected: finalRejected,
  };
}