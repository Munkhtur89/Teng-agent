import React from "react";

export function IdSkeleton() {
  return (
    <div className="bg-white backdrop-blur-sm rounded-xl shadow-lg p-8 mt-10 mb-20 animate-pulse">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-gray-200 rounded-xl p-6 h-96"></div>
        </div>
      </div>
    </div>
  );
}
