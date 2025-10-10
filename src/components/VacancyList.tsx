import React from "react";
import type { Vacancy } from "../types/vacancy";
import VacancyCard from "./VacancyCard";

interface Props {
    items: Vacancy[];
}

const VacancyList: React.FC<Props> = ({ items }) => {
    if (!items.length) {
        return (
            <div className="p-6 text-center text-slate-500">
                Tidak ada lowongan yang cocok.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((v) => (
                <VacancyCard key={v.id_posisi} vacancy={v} />
            ))}
        </div>
    );
};

export default VacancyList;
