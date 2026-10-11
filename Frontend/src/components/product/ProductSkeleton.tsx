import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-steel-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      <div className="w-full h-48 bg-steel-200" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-16 bg-steel-200 rounded mb-2" />
          <div className="h-5 w-3/4 bg-steel-200 rounded mb-2" />
          <div className="h-3 w-1/3 bg-steel-100 rounded mb-3" />
        </div>
        <div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-steel-100">
            <div className="h-6 w-16 bg-steel-200 rounded" />
            <div className="h-4 w-20 bg-steel-200 rounded-full" />
          </div>
          <div className="h-9 w-full bg-steel-200 rounded-xl mt-3" />
        </div>
      </div>
    </div>
  );
};
