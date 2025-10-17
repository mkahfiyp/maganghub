import { useEffect, useMemo, useState } from "react";
import type { Filters, Vacancy } from "./types/vacancy";
import FilterSidebar from "./components/FilterSidebar";
import VacancyList from "./components/VacancyList";
import { parseProgramStudi } from "./utils/parse";
import { Button } from "./components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StatistikDiterima from "./components/statistikDiterima";

const ITEMS_PER_PAGE = 21; // Jumlah item per halaman

const App = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    province: "",
    company: "",
    program: "",
    kota: "",
    sortBy: "",
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
    let result = vacancies.filter((v) => {
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
    if (filters.sortBy === "jumlah_terdaftar_asc") {
      result.sort((a, b) => (a.jumlah_terdaftar || 0) - (b.jumlah_terdaftar || 0));
    } else if (filters.sortBy === "jumlah_terdaftar_desc") {
      result.sort((a, b) => (b.jumlah_terdaftar || 0) - (a.jumlah_terdaftar || 0));
    }

    if (filters.sortBy === "chance_asc") {
      result.sort((a, b) => {
        const ratioA = a.jumlah_kuota && a.jumlah_terdaftar ? (a.jumlah_kuota / a.jumlah_terdaftar) : 0;
        const ratioB = b.jumlah_kuota && b.jumlah_terdaftar ? (b.jumlah_kuota / b.jumlah_terdaftar) : 0;
        return ratioA - ratioB;
      });
    } else if (filters.sortBy === "chance_desc") {
      result.sort((a, b) => {
        const ratioA = a.jumlah_kuota && a.jumlah_terdaftar ? (a.jumlah_kuota / a.jumlah_terdaftar) : 0;
        const ratioB = b.jumlah_kuota && b.jumlah_terdaftar ? (b.jumlah_kuota / b.jumlah_terdaftar) : 0;
        return ratioB - ratioA;
      });
    }

    return result;
  }, [vacancies, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Lowongan</h1>
          <div className="text-sm text-black/50">
            <p>Update data : 2025/10/15 22.01</p>
          </div>
        </div>
      </header>

      <StatistikDiterima />
      
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
            <>
              <VacancyList items={paginatedItems} />

              {/* Pagination Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
