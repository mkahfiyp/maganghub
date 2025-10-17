import React, { useState, useEffect } from 'react';

interface StatistikData {
    "Jumlah Lowongan": number;
    "Jumlah Pelamar": number;
    "Jumlah Pendaftar Magang": number;
    "Jumlah Perusahaan": number;
    "Jumlah Peserta Magang": number;
}

interface ApiResponse {
    data: StatistikData;
}

const StatistikDiterima: React.FC = () => {
    const [statistik, setStatistik] = useState<StatistikData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');

    const fetchStatistik = async () => {
        try {
            setError(null);
            const response = await fetch('https://maganghub.kemnaker.go.id/be/v1/api/statistik_front_page');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            setStatistik(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
            console.error('Error fetching statistik:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
        setCurrentTime(timeString);
    };

    useEffect(() => {
        // Call API pertama kali
        fetchStatistik();

        // Update time pertama kali
        updateTime();

        // Set interval untuk call API setiap menit (60000ms)
        const apiInterval = setInterval(() => {
            fetchStatistik();
        }, 60000);

        // Set interval untuk update jam setiap detik (1000ms)
        const timeInterval = setInterval(() => {
            updateTime();
        }, 1000);

        // Cleanup interval saat component unmount
        return () => {
            clearInterval(apiInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    if (loading && !statistik) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg">Memuat data statistik...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-500 text-lg">Error: {error}</div>
            </div>
        );
    }

    if (!statistik) {
        return null;
    }

    return (
        <div className='max-w-7xl mx-auto px-4 py-8'>
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Statistik MagangHub
                    </h2>
                    <div className="bg-gray-100 p-3 rounded-lg inline-block">
                        <div className="text-lg font-semibold text-gray-700">
                            {currentTime}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Jumlah Lowongan</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {formatNumber(statistik["Jumlah Lowongan"])}
                        </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Jumlah Pelamar</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatNumber(statistik["Jumlah Pelamar"])}
                        </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">Jumlah Pendaftar Magang</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {formatNumber(statistik["Jumlah Pendaftar Magang"])}
                        </p>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">Jumlah Perusahaan</h3>
                        <p className="text-3xl font-bold text-orange-600">
                            {formatNumber(statistik["Jumlah Perusahaan"])}
                        </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Jumlah Peserta Magang</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {formatNumber(statistik["Jumlah Peserta Magang"])}
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Data diperbarui setiap menit
                </div>
            </div>
        </div>
    );
};

export default StatistikDiterima;