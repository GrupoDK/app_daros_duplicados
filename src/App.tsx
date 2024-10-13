import React, { useState, ChangeEvent } from 'react';
import { read, utils } from 'xlsx';
import { FileUp, AlertCircle } from 'lucide-react';

function App() {
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (jsonData.length === 0 || jsonData[0].length === 0) {
        throw new Error('El archivo Excel está vacío o no tiene columnas.');
      }

      const columnData = jsonData.slice(1).map(row => row[0]);
      const duplicateValues = findDuplicates(columnData);
      setDuplicates(duplicateValues);
      setError(null);
    } catch (err) {
      setError('Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
      setDuplicates([]);
    }
  };

  const findDuplicates = (arr: string[]): string[] => {
    const counts = arr.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).filter(key => counts[key] > 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buscador de Duplicados en Excel</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUp className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
            <p className="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
        </label>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Valores Duplicados:</h2>
            <ul className="list-disc pl-5 space-y-1">
              {duplicates.map((value, index) => (
                <li key={index} className="text-gray-600">{value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;