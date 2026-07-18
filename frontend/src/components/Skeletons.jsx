import React from 'react';

export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse soft-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-6 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse w-full">
      <div className="flex border-b border-slate-200 py-3 bg-slate-50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 h-4 mx-4 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex border-b border-slate-200 py-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 h-4 mx-4 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse soft-card p-6 w-full">
      <div className="h-6 w-1/4 rounded bg-slate-200 mb-6" />
      <div className="h-60 rounded bg-slate-100 flex items-end justify-between px-6 pt-6 pb-2">
        <div className="w-[8%] h-[30%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[50%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[75%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[40%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[85%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[60%] bg-slate-200 rounded-t" />
        <div className="w-[8%] h-[90%] bg-slate-200 rounded-t" />
      </div>
    </div>
  );
}
