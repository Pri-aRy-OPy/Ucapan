// FILE: pages/admin/index.js
import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../../firebase/config'; // Corrected Path
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner'; // Corrected Path
import Link from 'next/link';

function AdminLogin({ setEmail, setPassword, handleLogin, loading, error }) {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
                    <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50">
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>
                <Link href="/" className="block w-full text-center mt-4 text-sm text-gray-500 hover:text-gray-700">Kembali ke Beranda</Link>
            </div>
        </div>
    );
}

function AdminDashboard({ user, ucapanList, loading, handleDelete, handleLogout }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                        <p className="text-sm text-gray-500">Email: {user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Logout</button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Total Ucapan Dibuat</h3>
                    <p className="mt-1 text-3xl font-semibold text-indigo-600">{ucapanList.length}</p>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="border-t border-gray-200 overflow-x-auto">
                        {loading ? <LoadingSpinner /> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50"><tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ucapanList.map((ucapan) => (
                                        <tr key={ucapan.id}>
                                            <td className="px-6 py-4"><img className="h-10 w-10 rounded-full object-cover" src={ucapan.fotoURL} alt="" /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ucapan.nama}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><Link href={`/ucapan/${ucapan.slug}`} target="_blank" className="text-indigo-600 hover:text-indigo-900">Lihat</Link></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ucapan.createdAt.seconds * 1000).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleDelete(ucapan.id)} className="text-red-600 hover:text-red-900">Hapus</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [ucapanList, setUcapanList] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchUcapan = useCallback(async () => {
        if (!user) return;
        setDataLoading(true);
        try {
            const q = query(collection(db, 'ucapan'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setUcapanList(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Error fetching documents: ", error); }
        finally { setDataLoading(false); }
    }, [user]);

    useEffect(() => {
        if (user) { fetchUcapan(); }
    }, [user, fetchUcapan]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLoginError('Email atau password salah.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => { await signOut(auth); };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus ucapan ini?')) {
            try {
                await deleteDoc(doc(db, 'ucapan', id));
                fetchUcapan();
            } catch (error) { 
                console.error("Error deleting document: ", error);
                alert('Gagal menghapus data.');
            }
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex justify-center items-center"><LoadingSpinner /></div>;
    }

    if (!user) {
        return <AdminLogin setEmail={setEmail} setPassword={setPassword} handleLogin={handleLogin} loading={loginLoading} error={loginError} />;
    }

    return <AdminDashboard user={user} ucapanList={ucapanList} loading={dataLoading} handleDelete={handleDelete} handleLogout={handleLogout} />;
}

