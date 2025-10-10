import React, { useEffect, useMemo, useState } from "react";
import type { Filters, Vacancy } from "../types/vacancy";
import { parseProgramStudi } from "../utils/parse";
import FilterSelect from "./FilterSelect";
import { Button } from "./ui/button";

interface Props {
    vacancies: Vacancy[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterSidebar: React.FC<Props> = ({ vacancies, filters, setFilters }) => {
    const provinces = useMemo(() => {
        const s = new Set<string>();
        vacancies.forEach((v) => v.perusahaan?.nama_provinsi && s.add(v.perusahaan.nama_provinsi));
        return Array.from(s).sort();
    }, [vacancies]);

    const companies = useMemo(() => {
        const s = new Set<string>();
        vacancies.forEach((v) => v.perusahaan?.nama_perusahaan && s.add(v.perusahaan.nama_perusahaan));
        return Array.from(s).sort();
    }, [vacancies]);

    const programs = useMemo(() => {
        const s = new Set<string>();
        vacancies.forEach((v) =>
            parseProgramStudi(v.program_studi).forEach((p) => s.add(p.title))
        );
        return Array.from(s).sort();
    }, [vacancies]);

    const kotas = useMemo(() => {
        const s = new Set<string>();
        vacancies.forEach((v) => v.perusahaan?.nama_kabupaten && s.add(v.perusahaan.nama_kabupaten));
        return Array.from(s).sort();
    }, [vacancies])

    // const update = (key: keyof Filters, value: string) =>
    //     setFilters((prev) => ({ ...prev, [key]: value }));

    // const reset = () =>
    //     setFilters({ q: "", province: "", company: "", program: "", kota: "" });

    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const updateLocal = (key: keyof Filters, value: string) =>
        setLocalFilters((prev) => ({ ...prev, [key]: value }));

    const applyFilter = () => setFilters(localFilters);

    const reset = () => {
        const empty = { q: "", province: "", company: "", program: "", kota: "" };
        setLocalFilters(empty);
        setFilters(empty);
    };

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    return (
        <aside className="p-4 bg-white rounded-xl shadow-sm sticky top-4 h-fit overflow-auto">
            <h4 className="font-semibold mb-3">Filter Lowongan</h4>

            <label className="block text-xs mb-1">Cari posisi</label>
            <input
                value={localFilters.q}
                onChange={(e) => updateLocal("q", e.target.value)}
                placeholder="Ketik nama posisi..."
                className="w-full text-sm p-2 rounded border focus:ring"
            />

            <FilterSelect
                label="Provinsi"
                value={localFilters.province}
                onChange={(v) => updateLocal("province", v)}
                options={provinces}
            />
            <FilterSelect
                label="Kota/Kab"
                value={localFilters.kota}
                onChange={(v) => updateLocal("kota", v)}
                options={kotas}
            />
            <FilterSelect
                label="Perusahaan"
                value={localFilters.company}
                onChange={(v) => updateLocal("company", v)}
                options={companies}
            />
            <FilterSelect
                label="Program Studi"
                value={localFilters.program}
                onChange={(v) => updateLocal("program", v)}
                options={programs}
                placeholder="Pilih atau ketik program studi..."
            />

            <div className="mt-5 flex gap-2">
                <Button
                    variant={"destructive"}
                    onClick={reset}
                    // className="mt-5 w-full border rounded py-2 text-sm hover:bg-slate-50"
                    // className="flex-1 border rounded py-2 text-sm hover:bg-slate-50"
                    className="flex-1 border py-2 text-sm"
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    // className="flex-1 bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700"
                    className="flex-1 bg-blue-600 text-white py-2 text-sm hover:bg-blue-700"
                    onClick={(e) => { e.preventDefault(); applyFilter(); }}
                >
                    Cari
                </Button>
            </div>
        </aside>
    );
};

export default FilterSidebar;
