// FILE: components/LoadingSpinner.js
// Deskripsi: Komponen UI untuk indikator loading.

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center my-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
    </div>
  );
}

