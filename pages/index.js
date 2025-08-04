// FILE: pages/index.js
// Deskripsi: Halaman utama untuk pengguna membuat ucapan.

import { useState, useRef } from 'react';
import Link from 'next/link';
import { storage, db } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Modal from 'components/Modal';

export default function HomePage() {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Harap pilih file gambar (JPG, PNG, dll).');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !file) {
            setError('Nama dan foto tidak boleh kosong.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
            const uniqueSlug = `${sanitizedName}-${Date.now()}`;
            const storageRef = ref(storage, `ucapan-foto/${uniqueSlug}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                () => {}, // Progress
                (error) => {
                    console.error("Upload error:", error);
                    setError('Gagal mengunggah foto. Coba lagi.');
                    setLoading(false);
                }, 
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await addDoc(collection(db, 'ucapan'), {
                        nama: name.trim(),
                        slug: uniqueSlug,
                        fotoURL: downloadURL,
                        createdAt: serverTimestamp()
                    });
                    const generatedLink = `${window.location.origin}/ucapan/${uniqueSlug}`;
                    setModalInfo({
                        message: `Ucapan berhasil dibuat! Bagikan link ini:`,
                        link: generatedLink
                    });
                    setLoading(false);
                    setName('');
                    setFile(null);
                    if(fileInputRef.current) fileInputRef.current.value = "";
                }
            );
        } catch (err) {
            console.error("Firestore error:", err);
            setError('Terjadi kesalahan. Gagal membuat ucapan.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col justify-center items-center p-4">
            {modalInfo && <Modal message={modalInfo.message} link={modalInfo.link} onClose={() => setModalInfo(null)} />}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all hover:scale-105 duration-500">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Pembuat Ucapan Ulang Tahun</h1>
                <p className="text-gray-500 mb-8">Buat dan bagikan ucapan spesial dalam sekejap!</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama yang berulang tahun" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                    {file && <p className="text-xs text-gray-500 mt-2">File dipilih: {file.name}</p>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                        {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Buat Ucapan Sekarang!'}
                    </button>
                </form>
            </div>
            <footer className="mt-8 text-gray-600 text-sm">
                Dibuat dengan ❤️ oleh anu. | <Link href="/admin" className="text-blue-500 hover:underline">Admin Login</Link>
            </footer>
        </div>
    );
}

