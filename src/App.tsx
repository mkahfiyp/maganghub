import { useEffect, useMemo, useState } from "react";
import type { Filters, Vacancy } from "./types/vacancy";
import FilterSidebar from "./components/FilterSidebar";
import VacancyList from "./components/VacancyList";
import { parseProgramStudi } from "./utils/parse";

const App = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    province: "",
    company: "",
    program: "",
    kota: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/vacancies-aktif.json");
        const json = await res.json();
        setVacancies(json.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      const q = filters.q.toLowerCase();
      const programs = parseProgramStudi(v.program_studi).map((p) =>
        p.title.toLowerCase()
      );

      if (
        q &&
        !v.posisi.toLowerCase().includes(q) &&
        !v.perusahaan?.nama_perusahaan?.toLowerCase().includes(q)
      )
        return false;
      if (filters.province && v.perusahaan?.nama_provinsi !== filters.province)
        return false;
      if (filters.kota && v.perusahaan?.nama_kabupaten !== filters.kota)
        return false;
      if (filters.company && v.perusahaan?.nama_perusahaan !== filters.company)
        return false;
      if (filters.program && !programs.includes(filters.program.toLowerCase()))
        return false;
      return true;
    });
  }, [vacancies, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Katalog Lowongan</h1>
          {/* <nav className="hidden md:flex gap-4 text-sm text-slate-600">
            <a href="#">Home</a>
            <a href="#">Lowongan</a>
            <a href="#">Tentang</a>
          </nav> */}
          <div className="text-sm text-black/50">
            <p>Update data : 2025/10/10 20.22</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <FilterSidebar
          vacancies={vacancies}
          filters={filters}
          setFilters={setFilters}
        />

        <section>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lowongan Aktif</h2>
            <span className="text-sm text-slate-500">
              {filtered.length} hasil
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">Memuat data...</div>
          ) : (
            <VacancyList items={filtered} />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
