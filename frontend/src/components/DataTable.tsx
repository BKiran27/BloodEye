import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({ data, columns, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-slate-700">
                  {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
