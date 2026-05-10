export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          Loading products...
        </p>
      </div>
    </div>
  );
}