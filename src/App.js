import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, PieChart, Clock, Settings, Plus, Search, 
  ChevronDown, ChevronRight, Wallet, ArrowUpCircle, ArrowDownCircle,
  Trash2, Download, Info, Filter, X, Pencil, Calendar, 
  Briefcase, TrendingUp, Gift, Landmark
} from 'lucide-react';
import { 
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- 1. DATA & KONSTANTA ---

// KATEGORI PENGELUARAN (LAMA)
const EXPENSE_CATEGORIES = {
  Makanan: ['Jajan', 'Makan berat', 'Minuman', 'Snack', 'Kopi / Nongkrong', 'Makan di luar', 'Masak sendiri'],
  Transportasi: ['Bensin', 'Parkir', 'Ojek online', 'Transport umum', 'Servis kendaraan', 'Tol'],
  'Tempat Tinggal': ['Kos / Kontrakan', 'Listrik', 'Air', 'Internet', 'Kebersihan', 'Perbaikan'],
  Pendidikan: ['Uang kuliah', 'Buku', 'Alat tulis', 'Print / Fotokopi', 'Kursus / Pelatihan', 'Sertifikasi'],
  Kesehatan: ['Obat', 'Klinik / Dokter', 'Vitamin', 'BPJS / Asuransi', 'Alat kesehatan'],
  Hiburan: ['Nonton', 'Game', 'Streaming', 'Jalan-jalan', 'Hobi', 'Event'],
  Belanja: ['Pakaian', 'Aksesoris', 'Elektronik', 'Kebutuhan pribadi', 'Online shop'],
  'Tabungan & Investasi': ['Tabungan', 'Dana darurat', 'Investasi', 'Sedekah / Donasi'],
  'Lain-lain': ['Tidak terduga', 'Administrasi', 'Denda', 'Biaya tambahan']
};

// KATEGORI PEMASUKAN (BARU - SESUAI REQUEST)
const INCOME_CATEGORIES = {
  'Menjual Tenaga & Waktu': ['Gaji / Upah', 'Honor', 'Freelance', 'Lembur / Overtime'],
  'Menjual Keahlian / Skill': ['Konsultan', 'Tutor / Mentor', 'Bug Bounty / CTF', 'Jasa Audit / Review'],
  'Menjual Barang': ['Jual Produk Fisik', 'Reseller / Dropshipper', 'Jual Barang Bekas', 'UMKM'],
  'Karya & Aset Intelektual': ['Buku / E-book', 'Musik / Foto / Video', 'Software / Aplikasi', 'Lisensi / Royalti'],
  'Bisnis': ['Usaha Sendiri', 'Startup', 'Franchise', 'Agency'],
  'Investasi': ['Saham (Dividen/Gain)', 'Reksa Dana', 'Obligasi', 'Properti', 'Crypto'],
  'Bunga & Bagi Hasil': ['Deposito', 'Tabungan Berbunga', 'Bagi Hasil (Syariah)', 'P2P Lending'],
  'Hadiah & Keberuntungan': ['Undian / Giveaway', 'Lomba / Kompetisi', 'Beasiswa', 'Hadiah Prestasi'],
  'Bantuan & Transfer': ['Dari Orang Tua/Keluarga', 'Tunjangan', 'Subsidi', 'Zakat/Sedekah (Masuk)'],
  'Sewa Aset': ['Sewa Rumah / Kos', 'Sewa Kendaraan', 'Sewa Alat', 'Monetisasi Web / Channel'],
  'Lainnya': ['Lainnya'] 
};

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#0ea5e9', '#f97316', '#ef4444', '#6366f1', '#ec4899'];

// Generate List 12 Bulan Terakhir
const getMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy', { locale: id });
    options.push({ value, label });
  }
  return options;
};

const INITIAL_DATA = [];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// --- 2. KOMPONEN UTAMA ---

export default function MoneyBuddyApp() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [transactions, setTransactions] = useState(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Filter Data
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Hitung Saldo
  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // CRUD Functions
  const handleSaveTransaction = (data) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === data.id ? data : t));
    } else {
      setTransactions(prev => [data, ...prev]);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleResetData = () => {
    setTransactions([]);
    alert('Semua data berhasil dihapus.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <Dashboard transactions={filteredTransactions} summary={summary} />;
      case 'statistik': return <Statistics transactions={filteredTransactions} />;
      case 'riwayat': return <History transactions={filteredTransactions} onDelete={handleDeleteTransaction} onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'pengaturan': return <SettingsPage onReset={handleResetData} />;
      default: return <Dashboard transactions={filteredTransactions} summary={summary} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
              <Wallet size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">Money Buddy</h1>
              <p className="text-xs text-gray-500">Kelola Keuanganmu</p>
            </div>
          </div>
          <div className="relative">
             <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 cursor-pointer">
                <Calendar size={14} className="text-teal-500" />
                <select 
                  className="bg-transparent outline-none appearance-none cursor-pointer pr-4"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {getMonthOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
             </div>
          </div>
        </div>
        
        {/* Navigation Tabs (Desktop) */}
        <div className="max-w-4xl mx-auto px-4 mt-2 overflow-x-auto hidden md:block">
           <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              {['Beranda', 'Statistik', 'Riwayat', 'Pengaturan'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.toLowerCase() ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <div className="flex items-center gap-2">
                     {tab === 'Beranda' && <Home size={16} />}
                     {tab === 'Statistik' && <PieChart size={16} />}
                     {tab === 'Riwayat' && <Clock size={16} />}
                     {tab === 'Pengaturan' && <Settings size={16} />}
                     {tab}
                  </div>
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* FAB */}
      <button 
        onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
        className="fixed bottom-20 md:bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <Plus size={24} />
        <span className="font-semibold hidden md:inline">Tambah Transaksi</span>
      </button>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center md:hidden z-40">
        {[
          { id: 'beranda', icon: Home, label: 'Beranda' },
          { id: 'statistik', icon: PieChart, label: 'Statistik' },
          { id: 'riwayat', icon: Clock, label: 'Riwayat' },
          { id: 'pengaturan', icon: Settings, label: 'Akun' },
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-teal-500' : 'text-gray-400'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TransactionModal 
          onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} 
          onSave={handleSaveTransaction} 
          initialData={editingTransaction}
        />
      )}
    </div>
  );
}

// --- 3. SUB-KOMPONEN PAGE ---

function Dashboard({ transactions, summary }) {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      name: key, value: grouped[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <p className="flex items-center gap-2 text-teal-50 text-sm font-medium"><Wallet size={16} /> Total Saldo</p>
          <h2 className="text-4xl font-bold mt-2">{formatRupiah(summary.balance)}</h2>
          <div className="flex gap-4 mt-6">
            <div className="flex-1 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-50 text-xs mb-1"><ArrowUpCircle size={14} /> Pemasukan</div>
              <p className="font-bold text-lg">{formatRupiah(summary.income)}</p>
            </div>
            <div className="flex-1 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-50 text-xs mb-1"><ArrowDownCircle size={14} /> Pengeluaran</div>
              <p className="font-bold text-lg">{formatRupiah(summary.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><PieChart size={18} className="text-teal-500" /> Pengeluaran</h3>
          <div className="h-64 flex items-center justify-center">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie width={400} height={400}>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                  </RechartsPie>
                </ResponsiveContainer>
             ) : <p className="text-gray-400 text-sm">Belum ada data pengeluaran</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-700">Transaksi Terbaru</h3></div>
           <div className="space-y-4">
              {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} t={t} />)}
              {transactions.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Belum ada transaksi</p>}
           </div>
        </div>
      </div>
    </div>
  );
}

function Statistics({ transactions }) {
  const expenseData = useMemo(() => {
     const expenses = transactions.filter(t => t.type === 'expense');
     const grouped = {};
     let totalExpense = 0;
     expenses.forEach(t => {
       if (!grouped[t.category]) grouped[t.category] = { total: 0, subs: {} };
       grouped[t.category].total += t.amount;
       const subKey = t.subCategory || 'Umum';
       grouped[t.category].subs[subKey] = (grouped[t.category].subs[subKey] || 0) + t.amount;
       totalExpense += t.amount;
     });

     return Object.keys(grouped).map(key => ({
       category: key,
       amount: grouped[key].total,
       percentage: totalExpense > 0 ? (grouped[key].total / totalExpense) * 100 : 0,
       details: Object.keys(grouped[key].subs).map(sub => ({ name: sub, amount: grouped[key].subs[sub] })).sort((a,b) => b.amount - a.amount)
     })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-teal-500" /> Detail Pengeluaran</h3>
        <div className="space-y-2">
           {expenseData.map((item, idx) => <AccordionItem key={item.category} item={item} color={COLORS[idx % COLORS.length]} />)}
           {expenseData.length === 0 && <p className="text-gray-400 text-sm">Belum ada data</p>}
        </div>
      </div>
    </div>
  );
}

function AccordionItem({ item, color }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
           <div className="text-left">
             <p className="font-bold text-gray-800 text-sm">{item.category}</p>
             <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden"><div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: color }}></div></div>
           </div>
        </div>
        <div className="text-right">
           <p className="font-bold text-gray-800 text-sm">{formatRupiah(item.amount)}</p>
           <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">{item.percentage.toFixed(1)}% <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div>
        </div>
      </button>
      {isOpen && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2">
           {item.details.map(detail => (
             <div key={detail.name} className="flex justify-between text-sm text-gray-600 pl-6 border-l-2 border-gray-200"><span>{detail.name}</span><span className="font-medium">{formatRupiah(detail.amount)}</span></div>
           ))}
        </div>
      )}
    </div>
  )
}

function History({ transactions, onDelete, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter(t => t.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()) || (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())));
    const groups = {};
    filtered.forEach(t => {
      const dateKey = t.date; 
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.keys(groups).sort().reverse().map(date => ({ date, items: groups[date] }));
  }, [transactions, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Cari transaksi / catatan..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className="space-y-6">
        {groupedTransactions.map(group => (
           <div key={group.date}>
              <p className="text-sm text-gray-500 font-medium mb-2 ml-1">{format(new Date(group.date), 'EEEE, d MMMM yyyy', { locale: id })}</p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {group.items.map((t, idx) => (
                  <div key={t.id} className={`${idx !== group.items.length - 1 ? 'border-b border-gray-50' : ''} px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center group`}>
                     <TransactionItem t={t} simple />
                     <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(t)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(t.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        ))}
        {groupedTransactions.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">Tidak ditemukan transaksi</p>}
      </div>
    </div>
  );
}

function SettingsPage({ onReset }) {
  const menus = [
    { title: 'Export Data', icon: Download, desc: 'Unduh laporan CSV/PDF', action: () => alert('Fitur Export akan segera hadir!') },
    { title: 'Hapus Semua Data', icon: Trash2, desc: 'Reset aplikasi ke awal', danger: true, action: () => { if (window.confirm('Hapus SEMUA data?')) onReset(); } },
  ];

  return (
     <div className="space-y-6">
        <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl flex items-start gap-4">
           <div className="bg-teal-500 text-white p-3 rounded-xl"><Wallet size={24} /></div>
           <div><h3 className="font-bold text-gray-800 text-lg">Money Buddy</h3><p className="text-sm text-gray-500 mb-2">Versi 1.2.0 (Fixed Income)</p><p className="text-sm text-gray-600 leading-relaxed">Kelola keuangan jadi lebih mudah.</p></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {menus.map((menu, idx) => (
             <button key={menu.title} onClick={menu.action} className={`w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${idx !== menus.length -1 ? 'border-b border-gray-100' : ''}`}>
               <div className={`p-2 rounded-lg ${menu.danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}><menu.icon size={20} /></div>
               <div><h4 className={`font-medium ${menu.danger ? 'text-red-600' : 'text-gray-800'}`}>{menu.title}</h4><p className="text-xs text-gray-400 mt-1">{menu.desc}</p></div>
             </button>
           ))}
        </div>
     </div>
  );
}

// --- 4. KOMPONEN UTILITAS ---

function TransactionItem({ t, simple = false }) {
  const isExpense = t.type === 'expense';
  
  const getIcon = (cat) => {
    // Expense Icons
    if(cat === 'Makanan') return '🍜';
    if(cat === 'Hiburan') return '🎮';
    if(cat === 'Belanja') return '🛍️';
    if(cat === 'Transportasi') return '🚗';
    
    // Income Icons (New)
    if(cat.includes('Tenaga')) return '💼';
    if(cat.includes('Keahlian')) return '🧠';
    if(cat.includes('Barang')) return '📦';
    if(cat.includes('Investasi')) return '📈';
    if(cat.includes('Hadiah')) return '🎁';
    if(cat.includes('Bisnis')) return '🏢';
    
    return isExpense ? '📄' : '💰';
  }

  return (
    <div className="flex-1 flex justify-between items-center py-1">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isExpense ? 'bg-red-50' : 'bg-green-50'}`}>
           {getIcon(t.category)}
        </div>
        <div>
           <p className="font-semibold text-gray-800 text-sm">{t.category}</p>
           <p className="text-xs text-gray-500">{t.subCategory} {t.note && <span className="text-teal-600 italic"> • "{t.note}"</span>} {simple ? '' : ` • ${t.date}`}</p>
        </div>
      </div>
      <span className={`font-bold text-sm mr-4 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
         {isExpense ? '-' : '+'} {formatRupiah(t.amount)}
      </span>
    </div>
  )
}

// --- 5. MODAL FORM (UPDATED LOGIC) ---

function TransactionModal({ onClose, onSave, initialData }) {
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  // Tentukan List Kategori berdasarkan Tipe (Pemasukan / Pengeluaran)
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Reset kategori saat tipe berubah (Kecuali saat mode edit data lama)
  useEffect(() => {
    if (!initialData) { 
      setCategory('');
      setSubCategory('');
    } else if (initialData.type !== type) {
      setCategory('');
      setSubCategory('');
    }
  }, [type, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    onSave({
      id: initialData?.id || Date.now(),
      type,
      amount: parseInt(amount),
      category,
      subCategory: subCategory || category,
      note,
      date
    });
  };

  const availableSubCategories = currentCategories[category] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-teal-500 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}>Pengeluaran</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500'}`}>Pemasukan</button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah (Rp)</label>
            <input type="number" className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-teal-500 outline-none py-2 px-1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kategori ({type === 'expense' ? 'Keluar' : 'Masuk'})</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-teal-500" value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); }} required>
                    <option value="">Pilih...</option>
                    {Object.keys(currentCategories).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sub-Kategori</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-teal-500" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} disabled={!category}>
                    <option value="">Detail...</option>
                    {availableSubCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Catatan (Opsional)</label>
            <input type="text" placeholder="Detail tambahan..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
            <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl mt-4 shadow-md active:scale-95 transition-transform">
            {initialData ? 'Update Transaksi' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}