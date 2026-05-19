import React from 'react';
import { X, BookOpen, Calendar, Hash } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ArchiveModalProps {
  onClose: () => void;
  onSelectIssue: (issue: any) => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ onClose, onSelectIssue }) => {
  const issues = useQuery(api.newsroom.queries.getArchiveIndex);
  const loading = issues === undefined;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white text-black w-full max-w-4xl max-h-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-black/10">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-black/10 flex items-center justify-between shrink-0 bg-neutral-50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-serif text-2xl font-medium tracking-tight">The Archive</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600 gap-4">
              <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <p className="font-mono text-sm uppercase tracking-widest">Retrieving Records...</p>
            </div>
          ) : (issues || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600 gap-2">
              <BookOpen className="w-12 h-12 opacity-20 mb-2" />
              <p className="font-serif text-xl">The archive is empty.</p>
              <p className="font-mono text-xs uppercase tracking-widest">No issues found in database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(issues || []).map((issue: any) => (
                <button
                  key={issue._id}
                  onClick={() => onSelectIssue(issue)}
                  className="group flex flex-col text-left border border-black/10 rounded-lg overflow-hidden hover:border-black hover:shadow-lg transition-all bg-white"
                >
                  <div className="bg-neutral-100 p-6 border-b border-black/10 group-hover:bg-black group-hover:text-white transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {issue.vol}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider uppercase flex items-center gap-1 opacity-60">
                        <Calendar className="w-3 h-3" />
                        {issue.date}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl leading-tight font-medium line-clamp-2">
                      {issue.theme || "Untitled Issue"}
                    </h3>
                  </div>
                  <div className="p-4 bg-white text-black group-hover:bg-neutral-50 transition-colors flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-700">
                      ID: {issue._id.slice(0, 8)}...
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Load <span className="text-lg leading-none">→</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
};
