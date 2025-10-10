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
