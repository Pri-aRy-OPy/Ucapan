// FILE: components/Modal.js
// Deskripsi: Komponen UI untuk menampilkan pesan pop-up.

export default function Modal({ message, link, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl text-center max-w-sm w-full">
        <p className="mb-4 text-gray-700 whitespace-pre-wrap">{message}</p>
        {link && (
          <input
            type="text"
            readOnly
            value={link}
            className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 mb-4 text-center text-sm"
            onClick={(e) => e.target.select()}
          />
        )}
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

