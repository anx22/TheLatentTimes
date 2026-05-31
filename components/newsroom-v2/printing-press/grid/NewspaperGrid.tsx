import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../frontendApi';

export const NewspaperGrid: React.FC = () => {
  const issues = useQuery(api.newsroom.queries.getArchiveIndex) || [];
  
  if (issues.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
        No issues published yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {issues.map((issue: any) => (
        <div key={issue._id} className="border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-500 transition-colors">
          <h3 className="text-white font-bold font-mono text-sm tracking-tight">{issue.theme}</h3>
          <p className="text-zinc-500 text-[10px] font-mono mt-1">{issue.date}</p>
        </div>
      ))}
    </div>
  );
};
