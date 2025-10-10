export interface ProgramStudy {
    value: string;
    title: string;
}

export interface Company {
    id_perusahaan: string;
    nama_perusahaan: string;
    alamat?: string;
    logo?: string | null;
    nama_provinsi?: string;
    nama_kabupaten?: string;
}

export interface Schedule {
    tanggal_batas_pendaftaran?: string;
    tanggal_pendaftaran_akhir?: string;
    tanggal_mulai?: string;
}

export interface Vacancy {
    id_posisi: string;
    posisi: string;
    deskripsi_posisi: string;
    jumlah_kuota?: number;
    jumlah_terdaftar?: number;
    program_studi?: string | ProgramStudy[];
    perusahaan?: Company;
    jadwal?: Schedule;
}

export interface Filters {
    q: string;
    province: string;
    company: string;
    program: string;
    kota: string;
}