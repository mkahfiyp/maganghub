export function decompressJson(compressed: any): any {
  if (!compressed._meta) {
    return compressed; // Jika tidak terkompresi, return as is
  }

  const { keys, strings } = compressed._meta;
  
  // Reverse mapping
  const keyMap = Object.entries(keys).reduce((acc, [original, mapped]) => {
    acc[mapped as string] = original;
    return acc;
  }, {} as Record<string, string>);

  const stringMap = Object.entries(strings || {}).reduce((acc, [original, mapped]) => {
    acc[mapped as string] = original;
    return acc;
  }, {} as Record<string, string>);

  function decompress(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(decompress);
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const originalKey = keyMap[key] || key;
        let decompressedValue = value;
        
        // Decompress string values
        if (typeof value === 'string' && stringMap[value]) {
          decompressedValue = stringMap[value];
        } else {
          decompressedValue = decompress(value);
        }
        
        result[originalKey] = decompressedValue;
      }
      return result;
    }
    
    return obj;
  }

  const decompressed = decompress(compressed);
  
  // Hapus _meta setelah dekompresi
  delete decompressed._meta;
  
  return decompressed;
}