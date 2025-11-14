import React, { useState, useRef } from 'react';
import { FileUp, Download, Minimize2, FileJson, Loader2, Zap } from 'lucide-react';

type CompressionMode = 'standard' | 'aggressive';

export default function Compress() {
    const [inputJson, setInputJson] = useState('');
    const [compressedJson, setCompressedJson] = useState('');
    const [compressionMode, setCompressionMode] = useState<CompressionMode>('standard');
    const [stats, setStats] = useState<{
        original: number;
        compressed: number;
        saved: number;
        percent: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const workerRef = useRef<Worker | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initWorker = () => {
        if (!workerRef.current) {
            workerRef.current = new Worker(
                new URL('../workers/compressor.worker.ts', import.meta.url),
                { type: 'module' }
            );

            workerRef.current.onmessage = (e) => {
                const { type, data } = e.data;

                if (type === 'success') {
                    setCompressedJson(data.compressed);
                    setStats(data.stats);
                    setIsProcessing(false);
                    setProgress(100);
                } else if (type === 'error') {
                    setError(data.message);
                    setIsProcessing(false);
                    setProgress(0);
                } else if (type === 'progress') {
                    setProgress(data.progress);
                }
            };
        }
        return workerRef.current;
    };

    const compressJson = () => {
        setError('');
        setIsProcessing(true);
        setProgress(0);

        const worker = initWorker();
        worker.postMessage({
            type: 'compress',
            data: inputJson,
            mode: compressionMode
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setIsProcessing(true);
        setProgress(0);

        if (file.size > 10 * 1024 * 1024) {
            handleLargeFile(file);
        } else {
            handleSmallFile(file);
        }
    };

    const handleSmallFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            setInputJson(event.target?.result as string);
            setIsProcessing(false);
        };
        reader.onerror = () => {
            setError('Gagal membaca file');
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    const handleLargeFile = async (file: File) => {
        try {
            const text = await file.text();
            setInputJson(text);
            setIsProcessing(false);
        } catch (err) {
            setError('Gagal membaca file: ' + (err as Error).message);
            setIsProcessing(false);
        }
    };

    const downloadCompressed = () => {
        const blob = new Blob([compressedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed-${compressionMode}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const clearAll = () => {
        setInputJson('');
        setCompressedJson('');
        setStats(null);
        setError('');
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileJson className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">JSON Advanced Compressor</h1>
                    </div>
                    <p className="text-gray-600">
                        Kompresi file JSON dengan 2 mode: Standard (aman) & Aggressive (ultra compress)
                    </p>
                </div>

                {/* Compression Mode Selection */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode Kompresi:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setCompressionMode('standard')}
                            className={`p-4 rounded-lg border-2 transition ${compressionMode === 'standard'
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Minimize2 className="w-6 h-6 text-indigo-600" />
                                <h4 className="font-semibold text-lg">Standard</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                Hapus whitespace & formatting. Hemat ~30-70%. Tetap mudah dibaca jika di-beautify.
                            </p>
                        </button>

                        <button
                            onClick={() => setCompressionMode('aggressive')}
                            className={`p-4 rounded-lg border-2 transition ${compressionMode === 'aggressive'
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-6 h-6 text-purple-600" />
                                <h4 className="font-semibold text-lg">Aggressive</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                Minify keys, deduplicate strings, compress numbers. Hemat ~50-85%. Butuh decompress untuk dibaca.
                            </p>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Input JSON</h2>
                            <div className="flex gap-2">
                                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                                    <FileUp className="w-4 h-4" />
                                    Upload
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={isProcessing}
                                    />
                                </label>
                                {inputJson && (
                                    <button
                                        onClick={clearAll}
                                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={inputJson.length > 50000 ? inputJson.substring(0, 50000) + '\n\n... (file terlalu besar untuk ditampilkan)' : inputJson}
                            onChange={(e) => setInputJson(e.target.value)}
                            placeholder='Paste JSON atau upload file...'
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={isProcessing}
                        />

                        {isProcessing && progress < 100 && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Processing...</span>
                                    <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={compressJson}
                            disabled={!inputJson || isProcessing}
                            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {compressionMode === 'aggressive' ? <Zap className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                                    Compress JSON ({compressionMode})
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Output Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Hasil Kompresi</h2>
                            {compressedJson && (
                                <button
                                    onClick={downloadCompressed}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            )}
                        </div>

                        <textarea
                            value={compressedJson.length > 50000 ? compressedJson.substring(0, 50000) + '\n\n... (file terlalu besar untuk ditampilkan)' : compressedJson}
                            readOnly
                            placeholder="Hasil kompresi akan muncul di sini..."
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                        />

                        {stats && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-green-800 mb-2">Statistik Kompresi:</h3>
                                <div className="space-y-1 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Ukuran Original:</span>
                                        <span className="font-semibold">{formatBytes(stats.original)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ukuran Compressed:</span>
                                        <span className="font-semibold">{formatBytes(stats.compressed)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-700 font-semibold pt-2 border-t border-green-200">
                                        <span>Hemat:</span>
                                        <span>{formatBytes(stats.saved)} ({stats.percent}%)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Teknik Kompresi:</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-indigo-600 mb-2">Standard Mode:</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Hapus whitespace & indentasi</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>JSON tetap valid 100%</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Bisa di-beautify kembali</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-600 mb-2">Aggressive Mode:</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Minify key names (user_name → _u1)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Deduplicate string values</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Compress numbers (scientific notation)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Menyimpan mapping untuk decompress</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}