type CompressionMode = 'standard' | 'aggressive';

interface CompressionResult {
    compressed: string;
    stats: {
        original: number;
        compressed: number;
        saved: number;
        percent: string;
    };
}

// Standard compression: hapus whitespace saja
function standardCompress(data: string): string {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed);
}

// Aggressive compression dengan minifikasi
function aggressiveCompress(data: string): string {
    const parsed = JSON.parse(data);

    // Key mapping untuk minifikasi
    const keyMap: Record<string, string> = {};
    let keyCounter = 0;

    // String deduplication
    const stringMap: Record<string, string> = {};
    let stringCounter = 0;

    // Fungsi untuk minify keys
    function minifyKeys(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => minifyKeys(item));
        }

        if (obj !== null && typeof obj === 'object') {
            const result: any = {};

            for (const [key, value] of Object.entries(obj)) {
                // Minify key name
                if (!keyMap[key]) {
                    keyMap[key] = `_k${keyCounter++}`;
                }

                const minKey = keyMap[key];

                // Process value
                if (typeof value === 'string' && value.length > 10) {
                    // Deduplicate long strings
                    if (!stringMap[value]) {
                        stringMap[value] = `_s${stringCounter++}`;
                    }
                    result[minKey] = stringMap[value];
                } else if (typeof value === 'number' && Math.abs(value) > 10000) {
                    // Use scientific notation for large numbers
                    result[minKey] = parseFloat(value.toExponential(6));
                } else {
                    result[minKey] = minifyKeys(value);
                }
            }

            return result;
        }

        return obj;
    }

    const minified = minifyKeys(parsed);

    // Simpan mapping untuk decompress
    const compressed = {
        _meta: {
            keys: keyMap,
            strings: stringMap,
            version: 1
        },
        data: minified
    };

    return JSON.stringify(compressed);
}

self.onmessage = async (e: MessageEvent) => {
    const { type, data, mode } = e.data;

    if (type === 'compress') {
        try {
            self.postMessage({ type: 'progress', data: { progress: 10 } });

            let compressed: string;

            if (mode === 'aggressive') {
                self.postMessage({ type: 'progress', data: { progress: 30 } });
                compressed = aggressiveCompress(data);
                self.postMessage({ type: 'progress', data: { progress: 70 } });
            } else {
                self.postMessage({ type: 'progress', data: { progress: 50 } });
                compressed = standardCompress(data);
            }

            self.postMessage({ type: 'progress', data: { progress: 80 } });

            // Hitung stats
            const encoder = new TextEncoder();
            const originalSize = encoder.encode(data).length;
            const compressedSize = encoder.encode(compressed).length;
            const savedBytes = originalSize - compressedSize;
            const savedPercent = ((savedBytes / originalSize) * 100).toFixed(2);

            self.postMessage({
                type: 'success',
                data: {
                    compressed,
                    stats: {
                        original: originalSize,
                        compressed: compressedSize,
                        saved: savedBytes,
                        percent: savedPercent
                    }
                }
            });
        } catch (err) {
            self.postMessage({
                type: 'error',
                data: { message: 'JSON tidak valid: ' + (err as Error).message }
            });
        }
    }
};

export { };