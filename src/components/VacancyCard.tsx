import React from "react";
import type { Vacancy } from "../types/vacancy";
import { parseProgramStudi } from "../utils/parse";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Props {
    vacancy: Vacancy;
}

const VacancyCard: React.FC<Props> = ({ vacancy }) => {
    const company = vacancy.perusahaan;
    const jadwal = vacancy.jadwal;
    const programList = parseProgramStudi(vacancy.program_studi);

    return (
        <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col h-full">
            <header className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {company?.logo ? (
                        <img
                            src={company.logo}
                            alt={company.nama_perusahaan}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            No logo
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{vacancy.posisi}</h3>
                    <p className="text-xs text-gray-500">{company?.nama_perusahaan}</p>
                </div>
            </header>

            <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                {vacancy.deskripsi_posisi}
            </p>

            <div className="text-xs text-gray-500 space-y-1 flex-1">
                <div><b>Kuota:</b> {vacancy.jumlah_kuota ?? "-"}</div>
                <div><b>Pendaftar:</b> {vacancy.jumlah_terdaftar ?? 0}</div>
                <div><b>Provinsi:</b> {company?.nama_provinsi ?? "-"}</div>
                <div><b>Kota/Kab:</b> {company?.nama_kabupaten ?? "-"}</div>
                <div><b>Batas daftar:</b> {jadwal?.tanggal_pendaftaran_akhir ? new Date(jadwal.tanggal_pendaftaran_akhir).toLocaleDateString() : "-"}</div>
            </div>

            {programList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {programList.slice(0, 4).map((p) => (
                        <span
                            key={p.value}
                            className="text-[11px] px-2 py-1 bg-slate-100 rounded"
                        >
                            {p.title}
                        </span>
                    ))}
                    {programList.length > 4 && (
                        <span className="text-[11px] px-2 py-1 bg-slate-50 rounded">
                            +{programList.length - 4}
                        </span>
                    )}
                </div>
            )}

            <div className="pt-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 py-2.5" onClick={() => window.open(`https://maganghub.kemnaker.go.id/lowongan/view/${vacancy.id_posisi}`, "_blank")}>
                    Lihat Detail
                </Button>
            </div>
            <div className="pt-3 flex justify-end">
                <Badge variant={"outline"} className="text-xs bg-green-600 text-white font-bold">Change : {vacancy.jumlah_kuota && vacancy.jumlah_terdaftar ? `${(vacancy.jumlah_kuota / vacancy.jumlah_terdaftar * 100).toFixed(2)}%` : "-"}</Badge>
            </div>
        </article>
    );
};

export default VacancyCard;
