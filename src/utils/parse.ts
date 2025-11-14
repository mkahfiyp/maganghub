import type { ProgramStudy } from "../types/vacancy";

export function parseProgramStudi(input?: string | ProgramStudy[]): ProgramStudy[] {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// export function parseProgramStudi(raw: string | null | undefined): Array<{ title: string }> {
//   if (!raw || typeof raw !== "string") return [];
  
//   // Split by comma and trim whitespace
//   return raw
//     .split(",")
//     .map((item) => item.trim())
//     .filter((item) => item.length > 0)
//     .map((item) => ({ title: item }));
// }
