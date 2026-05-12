
import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle2, Clock, AlertCircle, 
  Search, Filter, TrendingUp, DollarSign, X, Receipt, 
  ChevronRight, Printer, Mail, Calendar, Hash, ShieldCheck, 
  User as UserIcon, BarChart3, FileBadge2
} from 'lucide-react';
import { Invoice, User } from '../types';

interface FinanceProps {
  user: User;
}

const mockInvoices: Invoice[] = [
    { 
      id: 'FAC-2024-001', 
      rif: 'J-12345678-9', 
      clientName: 'Inversiones El Sol', 
      amount: 450.00, 
      status: 'Paid', 
      date: '2024-02-10', 
      type: 'Venta',
      serial: 'POS77889900',
      controlNumber: '00-987744',
      items: [
        { name: 'POS PAX A920 Pro', qty: 1, price: 400 },
        { name: 'Sim Card Digitel 4G', qty: 1, price: 10 }
      ],
      posModel: 'PAX A920 Pro',
      simCount: 1,
      taxes: 40,
      paymentTerms: 'Contado',
      userId: 'USR-001',
      institution: 'Banesco',
      hasExtendedWarranty: true
    },
    { 
      id: 'FAC-2024-002', 
      rif: 'J-88223344-5', 
      clientName: 'Bodegón La Plaza', 
      amount: 15.00, 
      status: 'Pending', 
      date: '2024-02-12', 
      type: 'Servicio',
      serial: 'POS11223344',
      controlNumber: '00-112233',
      userId: 'USR-002',
      institution: 'Mercantil'
    },
    { 
      id: 'FAC-2024-003', 
      rif: 'J-99887766-1', 
      clientName: 'Farmacia Vital', 
      amount: 850.00, 
      status: 'Overdue', 
      date: '2024-01-25', 
      type: 'Venta',
      serial: 'POS99001122',
      posModel: 'Newland N910',
      simCount: 2,
      userId: 'USR-001',
      institution: 'Banesco',
      hasExtendedWarranty: false
    },
    { 
        id: 'FAC-2024-004', 
        rif: 'J-55443322-1', 
        clientName: 'Repuestos Caroní', 
        amount: 320.00, 
        status: 'Paid', 
        date: '2024-03-01', 
        type: 'Venta',
        serial: 'POS55667788',
        userId: 'USR-001',
        institution: 'Banesco',
        hasExtendedWarranty: true
      },
];

const Finance: React.FC<FinanceProps> = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'rif' | 'serial' | 'control'>('all');

    // Visibility Logic
    const filteredInvoices = mockInvoices.filter(inv => {
        // 1. Role based filter
        let shows = false;
        if (user.role === 'CCR' || user.role === 'Regional') shows = true;
        else if (user.role === 'Banco') shows = inv.institution === user.institution;
        else if (user.role === 'Agente') shows = inv.userId === user.id;

        if (!shows) return false;

        // 2. Search term filter
        const term = searchTerm.toLowerCase();
        if (!term) return true;

        if (filterType === 'rif') return inv.rif.toLowerCase().includes(term);
        if (filterType === 'serial') return inv.serial?.toLowerCase().includes(term);
        if (filterType === 'control') return inv.controlNumber?.toLowerCase().includes(term);
        
        return inv.clientName.toLowerCase().includes(term) || inv.id.toLowerCase().includes(term);
    });

    const handleDownloadReport = (type: 'user' | 'warranty') => {
        const msg = type === 'user' ? 'Generando reporte de ventas por usuario...' : 'Generando reporte de garantía extendida...';
        alert(msg);
        setTimeout(() => alert('Documento generado exitosamente (Simulado).'), 1000);
    };

    const handleDownloadInvoice = (id: string) => {
        alert(`Iniciando descarga de Factura Legal ${id} (SAP HANA Cloud PDF)...`);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header / Reports */}
            <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Historial de Facturación</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizado SAP HANA</p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => handleDownloadReport('user')}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/5"
                             >
                                <BarChart3 size={16} />
                                <span className="text-[9px] font-black uppercase tracking-tight">Reporte Ventas</span>
                             </button>
                             <button 
                                onClick={() => handleDownloadReport('warranty')}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/5"
                             >
                                <ShieldCheck size={16} />
                                <span className="text-[9px] font-black uppercase tracking-tight">Garantías</span>
                             </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Recaudado (Filtro)</p>
                            <p className="text-xl font-black text-blue-400 mt-1">
                                ${filteredInvoices.reduce((acc, curr) => acc + (curr.status === 'Paid' ? curr.amount : 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Pendiente (Filtro)</p>
                            <p className="text-xl font-black text-orange-400 mt-1">
                                ${filteredInvoices.reduce((acc, curr) => acc + (curr.status === 'Pending' ? curr.amount : 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                 <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                        { id: 'all', label: 'General' },
                        { id: 'rif', label: 'RIF' },
                        { id: 'serial', label: 'Serial' },
                        { id: 'control', label: 'Control' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => { setFilterType(tab.id as any); setSearchTerm(''); }}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${filterType === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                 </div>
                 <div className="flex gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                    <Search size={16} className="text-slate-400 ml-1 mt-0.5" />
                    <input 
                        type="text" 
                        placeholder={`Buscar por ${filterType === 'all' ? 'Afiliado o Factura' : filterType.toUpperCase()}...`} 
                        className="bg-transparent border-none outline-none text-xs w-full py-0.5 font-medium placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Documentos Encontrados</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{filteredInvoices.length} Items</span>
                </div>
                <div className="divide-y divide-slate-50">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                        <div 
                            key={inv.id} 
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 ${
                                inv.status === 'Paid' ? 'bg-green-50 text-green-600' : 
                                inv.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                            }`}>
                                <Receipt size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{inv.clientName}</h4>
                                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">{inv.id}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    {inv.date}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-slate-800 tracking-tight">${inv.amount.toFixed(2)}</p>
                                <ChevronRight size={14} className="text-slate-300 ml-auto mt-1" />
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-xs font-bold text-slate-400">No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedInvoice(null)}></div>
                    <div className="bg-white w-full rounded-t-[40px] relative shadow-2xl animate-fade-in-up p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Detalle de Factura</h3>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedInvoice.id}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-transform">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Client Header */}
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{selectedInvoice.clientName}</h4>
                                    <p className="text-xs font-bold text-slate-400 font-mono tracking-tighter">RIF: {selectedInvoice.rif}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {selectedInvoice.status}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl h-fit"><Hash size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Control SAP</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.controlNumber || '00-XXXXXX'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl h-fit"><Printer size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Serial POS</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.serial || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl h-fit"><Calendar size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Fecha Emisión</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-500 rounded-xl h-fit"><FileBadge2 size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Modelo POS</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.posModel || 'Universal'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-cyan-50 text-cyan-500 rounded-xl h-fit"><Clock size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Términos</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.paymentTerms || '30 Días'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-green-50 text-green-500 rounded-xl h-fit"><ShieldCheck size={16}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Garantía Ext.</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedInvoice.hasExtendedWarranty ? 'Activo' : 'Inactivo'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen de Cargo</h5>
                                </div>
                                <div className="p-4 space-y-3">
                                    {selectedInvoice.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold">{item.name} <span className="text-[10px] text-slate-300">x{item.qty}</span></span>
                                            <span className="font-black text-slate-800">${(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Impuestos (IVA 16%)</span>
                                        <span className="text-xs font-bold text-slate-700">${(selectedInvoice.taxes || (selectedInvoice.amount * 0.16)).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-800">Total Facturado</span>
                                        <span className="text-xl font-black text-blue-600">${selectedInvoice.amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <Download size={14} /> Descargar PDF
                                </button>
                                <button className="w-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all" onClick={() => alert('Acción de botón en Finance')}>
                                    <Mail size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
