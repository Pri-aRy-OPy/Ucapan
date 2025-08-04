// FILE: pages/ucapan/[slug].js
import { useRouter } from 'next/router';
import Link from 'next/link';
import { db } from '../../firebase/config'; // Corrected Path
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
import Confetti from '../../components/Confetti'; // Corrected Path
import LoadingSpinner from '../../components/LoadingSpinner'; // Corrected Path

export default function UcapanPage({ ucapanData, error }) {
    const router = useRouter();
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => console.log("Autoplay musik diblokir."));
        }
    }, [ucapanData]);

    const handleShare = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: `Selamat Ulang Tahun ${ucapanData?.nama}!`,
                text: 'Lihat ucapan spesial ini!',
                url: shareUrl,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl)
                .then(() => alert('Link ucapan telah disalin!'))
                .catch(() => alert('Gagal menyalin link.'));
        }
    };

    if (router.isFallback) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><LoadingSpinner /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-2xl text-red-600 font-bold mb-4">Oops! Terjadi Kesalahan</h2>
                <p className="text-red-500 mb-6">{error}</p>
                <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded-lg">Kembali ke Beranda</Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-purple-400 via-pink-400 to-rose-400 overflow-hidden flex flex-col items-center justify-center p-4 text-white">
            <Confetti />
            <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" autoPlay loop />
            <div className="relative z-20 text-center bg-black bg-opacity-20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-lg w-full">
                <img src={ucapanData.fotoURL} alt={`Foto ${ucapanData.nama}`} className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/E0BBE4/957DAD?text=Foto'; }} />
                <h2 className="text-2xl font-light">Selamat Ulang Tahun!</h2>
                <h1 className="text-4xl md:text-6xl font-extrabold my-3 tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>{ucapanData.nama}</h1>
                <p className="text-lg font-light max-w-md mx-auto mt-4">Semoga panjang umur, sehat selalu, dan semua impianmu tercapai. Hari ini adalah harimu, nikmatilah!</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={handleShare} className="w-full sm:w-auto bg-white text-purple-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-200">💌 Bagikan</button>
                    <Link href="/" className="w-full sm:w-auto text-center bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-purple-600">🏠 Buat Lagi</Link>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    try {
        const { slug } = context.params;
        const q = query(collection(db, 'ucapan'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { props: { error: 'Ucapan tidak ditemukan.' } };
        }

        const ucapanDoc = querySnapshot.docs[0];
        const ucapanData = {
            ...ucapanDoc.data(),
            createdAt: ucapanDoc.data().createdAt.toDate().toISOString(),
        };

        return { props: { ucapanData } };
    } catch (err) {
        console.error("Server-side fetch error:", err);
        return { props: { error: 'Gagal memuat data dari server.' } };
    }
}

            
