import { useEffect, useState } from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import type { Vacancy } from "../types/vacancy";
import VacancyList from "../components/VacancyList";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { favorites } = useFavorites();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>(""); // Tambahkan state untuk sortBy
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (favorites.length === 0) {
          setVacancies([]);
          setLoading(false);
          return;
        }

        // Fetch setiap vacancy berdasarkan id favorit
        const fetchPromises = favorites.map(async (id) => {
          try {
            const res = await fetch(
              `https://maganghub.kemnaker.go.id/be/v1/api/read/vacancies-aktif/${id}?order_direction=ASC&page=1&limit=10`
            );
            const json = await res.json();
            return json.data?.[0] || null;
          } catch (error) {
            console.error(`Error fetching vacancy ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const favoriteVacancies = results.filter((v): v is Vacancy => v !== null);

        setVacancies(favoriteVacancies);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [favorites]);

  // Sort berdasarkan chance
  const sortedVacancies = vacancies.sort((a, b) => {
    const chanceA = a.jumlah_kuota && a.jumlah_terdaftar ? (a.jumlah_kuota / a.jumlah_terdaftar) : 0;
    const chanceB = b.jumlah_kuota && b.jumlah_terdaftar ? (b.jumlah_kuota / b.jumlah_terdaftar) : 0;

    if (sortBy === "chance_asc") {
      return chanceA - chanceB;
    } else if (sortBy === "chance_desc") {
      return chanceB - chanceA;
    }
    return 0; // Tidak ada pengurutan
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h1 className="text-lg font-semibold">Lowongan Favorit</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-slate-500">
            {vacancies.length} lowongan favorit
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded p-1"
          >
            <option value="">Sort By</option>
            <option value="chance_asc">Chance Ascending</option>
            <option value="chance_desc">Chance Descending</option>
          </select>
        </div>

        {loading ? (
          <div className="p-6 text-center">Memuat data...</div>
        ) : sortedVacancies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg mb-2">Belum ada lowongan favorit</p>
            <p className="text-sm">
              Klik ikon ❤️ pada lowongan untuk menambahkan ke favorit
            </p>
          </div>
        ) : (
          <VacancyList items={sortedVacancies} />
        )}
      </main>
    </div>
  );
};

export default Favorites;