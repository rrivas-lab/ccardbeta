
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Target, 
  Users, Building2, MessageSquare, Plus, Filter, ArrowRight,
  ShieldAlert, Activity, ChevronRight, CheckCircle2, Clock, 
  Receipt, Archive, ShieldPlus, Download } from 'lucide-react';
import { User } from '../types';

// Mock Data for Portfolio Behavior
const portfolioStats = [
  { name: 'Total Equipos', value: 1250, change: '+45' },
  { name: 'Aumentos', value: 85, change: '+12%', color: 'text-green-500' },
  { name: 'Disminuciones', value: 12, change: '-4%', color: 'text-red-500' },
  { name: 'Sin Transar', value: 120, change: '9.6%', color: 'text-orange-500' },
];

const performanceData = [
  { name: 'Ene', ventas: 45, transacciones: 2400 },
  { name: 'Feb', ventas: 52, transacciones: 2100 },
  { name: 'Mar', ventas: 48, transacciones: 2800 },
  { name: 'Abr', ventas: 61, transacciones: 3200 },
  { name: 'May', ventas: 55, transacciones: 3000 },
];

const agentRanking = [
  { id: 1, name: 'Banesco', growth: '+15.2%', status: 'up', type: 'Banco' },
  { id: 2, name: 'BBVA Provincial', growth: '+12.8%', status: 'up', type: 'Banco' },
  { id: 3, name: 'Agente Capital', growth: '+8.4%', status: 'up', type: 'Agente' },
  { id: 4, name: 'Banco Mercantil', growth: '-2.1%', status: 'down', type: 'Banco' },
  { id: 5, name: 'Agente Occidente', growth: '-5.4%', status: 'down', type: 'Agente' },
];

const activeAlerts = [
  { id: 1, client: 'Bodegón Los Próceres', reason: '15 días sin transar', severity: 'medium', posId: 'POS-001' },
  { id: 2, client: 'Panadería Central', reason: '30 días sin transar', severity: 'high', posId: 'POS-042' },
  { id: 3, client: 'Farmacia 24/7', reason: 'Baja transaccionalidad (-40%)', severity: 'medium', posId: 'POS-088' },
  { id: 4, client: 'Inversiones Vega', reason: '30 días sin transar', severity: 'high', posId: 'POS-125' },
];

interface CCRManagementProps {
  user: User;
}

const CCRManagement: React.FC<CCRManagementProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'alerts' | 'agenda' | 'billing'>('overview');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalType, setGoalType] = useState<'recovery' | 'sales'>('sales');
  const [selectedAgent, setSelectedAgent] = useState('Banesco');
  const [goalValue, setGoalValue] = useState('');

  // Billing History State
  const [billingFilters, setBillingFilters] = useState({
    affiliate: '',
    rif: '',
    serial: '',
    controlNumber: ''
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'FAC-10020',
      rif: 'J-12345678-9',
      clientName: 'Inversiones El Sol',
      amount: 450.00,
      status: 'Paid',
      date: '2024-05-10',
      type: 'Venta',
      serial: 'POS-NEW-2024-101',
      controlNumber: 'Ctrl-00221',
      posModel: 'Newland N910',
      simCount: 1,
      taxes: 54.00,
      paymentTerms: 'Contado',
      userId: 'user-01',
      institution: 'Banco Exterior',
      hasExtendedWarranty: true
    },
    {
      id: 'FAC-10021',
      rif: 'J-98765432-1',
      clientName: 'Bodegón Express',
      amount: 210.00,
      status: 'Paid',
      date: '2024-05-09',
      type: 'Venta',
      serial: 'POS-PAX-2024-552',
      controlNumber: 'Ctrl-00222',
      posModel: 'PAX S920',
      simCount: 1,
      taxes: 25.20,
      paymentTerms: 'Financiado',
      userId: 'user-02',
      institution: 'Banplus',
      hasExtendedWarranty: false
    }
  ]);

  // Agenda State
  const [agenda, setAgenda] = useState([
    { id: 1, title: 'Reunión Banesco', type: 'Ventas', time: '10:00 AM', status: 'pending' },
    { id: 2, title: 'Visita Recuperación Vegui', type: 'Recuperación', time: '02:00 PM', status: 'pending' },
  ]);

  const handleAddGoal = () => {
    // Mock functionality
    alert(`Meta de ${goalType === 'sales' ? 'Ventas' : 'Recuperación'} asignada a ${selectedAgent} por ${goalValue}`);
    setShowGoalModal(false);
  };

  const handleAddToAgenda = (alert: any) => {
    const newItem = {
      id: agenda.length + 1,
      title: `Seguimiento: ${alert.client}`,
      type: alert.severity === 'high' ? 'Crítico' : 'Rutina',
      time: 'Próxima Disponible',
      status: 'pending'
    };
    setAgenda([...agenda, newItem]);
    alert(`Añadido a agenda: ${alert.client}`);
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Portfolio Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {portfolioStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between h-32">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.name}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold ${stat.color || 'text-blue-500'}`}>{stat.change}</span>
              <span className="text-[10px] text-slate-400 uppercase">este mes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Crecimiento Logístico</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Ventas y Transacciones</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-500">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Ventas
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-500">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Trans.
            </span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Tops */}
      <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Top Agentes / Bancos</h3>
          <ShieldAlert size={16} className="text-blue-400" />
        </div>
        <div className="space-y-4">
          {agentRanking.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${agent.status === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {agent.type === 'Banco' ? <Building2 size={16} /> : <Users size={16} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{agent.name}</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-black">{agent.type}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className={`flex flex-col items-end gap-1 text-xs font-black ${agent.status === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="flex items-center gap-1">
                    {agent.status === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    {agent.growth}
                  </div>
                  <button 
                    onClick={() => alert(`Agendando visita comercial con ${agent.name}`)}
                    className="text-[8px] uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    Programar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">Metas de Gestión</h3>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Recovery Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Activity size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700">Recuperación Equipos Sin Transar</span>
              </div>
              <span className="text-xs font-black text-blue-600">65%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[65%]" />
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest text-right">Objetivo: 200 Equipos</p>
          </div>

          {/* Sales Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700">Ventas Nuevos Puntos</span>
              </div>
              <span className="text-xs font-black text-blue-600">82%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[82%]" />
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest text-right">Objetivo: 500 Unidades</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
          <ShieldAlert className="text-blue-500 shrink-0" size={18} />
          <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
            Las metas asignadas se sincronizan automáticamente con los tableros de Agentes y Bancos a través del sistema central de monitoreo.
          </p>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="font-bold text-slate-800">Alertas Críticas</h3>
        <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
          <Filter size={10} /> Recientes
        </span>
      </div>
      
      {activeAlerts.map((alert) => (
        <div key={alert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">{alert.client}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{alert.reason}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[8px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 uppercase">ID: {alert.posId}</span>
              {alert.severity === 'high' && <span className="text-[8px] font-bold bg-red-100 px-1.5 py-0.5 rounded text-red-600 uppercase">Urgente</span>}
            </div>
          </div>
          <button 
            onClick={() => { try { const blob = new Blob([`Cliente: ${alert.client}\nPOS: ${alert.posId}\nMotivo: ${alert.reason}\nFuente: Data Integriti (mock)\nTel\u00e9fono: +58-414-555-0000\nCorreo: contacto@${alert.client.toLowerCase().replace(/\s+/g,'')}.com`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `contacto-${alert.posId}.txt`; a.click(); URL.revokeObjectURL(url); } catch(e){} }}
            title="Descargar contacto (mock Data Integriti)"
            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => handleAddToAgenda(alert)}
            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
          >
            <Plus size={20} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAgenda = () => (
      <div className="space-y-4 animate-fade-in pb-20">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Agenda Comercial</h3>
              <p className="text-xs text-slate-500 mt-1">{(agenda || []).length} eventos programados</p>
            </div>
          </div>
          {(agenda || []).length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Sin eventos en agenda</div>
          ) : (
            <div className="space-y-3">
              {(agenda || []).map((it, i) => (
                <div key={it.id || i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className={`w-2 h-2 rounded-full mt-2 ${it.type === 'Crítico' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{it.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{it.type} · {it.time}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Estado: {it.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  const renderBilling = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Historial de Facturación</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Afiliado</label>
            <input 
              type="text" 
              placeholder="Número de Afiliado"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
              value={billingFilters.affiliate}
              onChange={(e) => setBillingFilters({...billingFilters, affiliate: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RIF</label>
            <input 
              type="text" 
              placeholder="J-00000000-0"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
              value={billingFilters.rif}
              onChange={(e) => setBillingFilters({...billingFilters, rif: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial</label>
            <input 
              type="text" 
              placeholder="Serial POS"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
              value={billingFilters.serial}
              onChange={(e) => setBillingFilters({...billingFilters, serial: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nro Control</label>
            <input 
              type="text" 
              placeholder="0002231"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
              value={billingFilters.controlNumber}
              onChange={(e) => setBillingFilters({...billingFilters, controlNumber: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg" onClick={() => alert('Acción de botón en CCRManagement')}>
            Buscar Facturas
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => alert('Acción de botón en CCRManagement')}>
            Limpiar Filtros
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800">{inv.clientName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{inv.rif} • {inv.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{inv.amount.toFixed(2)} $</p>
                  <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Pagada</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-200/50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Modelo POS</p>
                  <p className="text-xs font-bold text-slate-700">{inv.posModel}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">SIM Cards</p>
                  <p className="text-xs font-bold text-slate-700">{inv.simCount} Unid.</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Impuestos (16%)</p>
                  <p className="text-xs font-bold text-slate-700">{inv.taxes?.toFixed(2)} $</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Modalidad</p>
                  <p className="text-xs font-bold text-blue-600">{inv.paymentTerms}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {inv.hasExtendedWarranty && (
                    <span className="flex items-center gap-1 text-[8px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">
                      <ShieldAlert size={10} /> Con Garantía Ext.
                    </span>
                  )}
                  <span className="text-[8px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                    Usuario: {inv.userId}
                  </span>
                </div>
                <button 
                  onClick={() => alert(`Descargando factura legal ${inv.id}`)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase hover:underline"
                >
                  <Calendar size={12} /> Descargar Factura Legal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Archives Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-5 rounded-[24px] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Archive size={48} />
          </div>
          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Reportes de Venta</h4>
          <h3 className="text-lg font-bold mb-3 tracking-tight">Archivo por Usuario</h3>
          <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all" onClick={() => alert('Acción de botón en CCRManagement')}>
            Descargar CSV
          </button>
        </div>
        <div className="bg-purple-900 p-5 rounded-[24px] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldPlus size={48} />
          </div>
          <h4 className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1">Garantías</h4>
          <h3 className="text-lg font-bold mb-3 tracking-tight">Archivo G. Extendida</h3>
          <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all" onClick={() => alert('Acción de botón en CCRManagement')}>
            Consultar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-12 -translate-y-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase bg-blue-600 px-2 py-0.5 rounded-md tracking-widest">CCR Executive</span>
            <span className="text-[9px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-md tracking-widest">Data Integriti</span>
            <span className="text-[9px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded-md tracking-widest">Sincronizado</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1">Centro de Control Cartera</h2>
          <p className="text-slate-400 text-xs font-medium tracking-wide">Monitoreo en tiempo real de Agentes y Bancos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
        {[
          { id: 'overview', icon: Activity, label: 'Monitor' },
          { id: 'goals', icon: Target, label: 'Metas' },
          { id: 'alerts', icon: ShieldAlert, label: 'Alarmas' },
          { id: 'agenda', icon: Calendar, label: 'Agenda' },
          { id: 'billing', icon: Receipt, label: 'Facturas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'agenda' && renderAgenda()}
        {activeTab === 'billing' && renderBilling()}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGoalModal(false)}></div>
          <div className="bg-white w-full rounded-t-[32px] relative shadow-2xl animate-fade-in-up p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">Asignar Nueva Meta</h3>
              <button onClick={() => setShowGoalModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Meta</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setGoalType('sales')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${goalType === 'sales' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}
                  >
                    Ventas Nuevas
                  </button>
                  <button 
                    onClick={() => setGoalType('recovery')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${goalType === 'recovery' ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}
                  >
                    Recuperación Sin Transar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Seleccionar Entidad</label>
                <select 
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="Banesco">Banesco (Banco)</option>
                  <option value="Mercantil">Mercantil (Banco)</option>
                  <option value="Agente Capital">Agente Capital (Aliado)</option>
                  <option value="BBVA">BBVA Provincial (Banco)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Valor Objetivo</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={goalValue}
                    onChange={(e) => setGoalValue(e.target.value)}
                    placeholder="Eje: 500"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase">Unidades</span>
                </div>
              </div>

              <button 
                onClick={handleAddGoal}
                disabled={!goalValue}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                Confirmar Asignación Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size, className }: { size: number, className?: string }) => (
  <Plus size={size} className={`${className} rotate-45`} />
);

export default CCRManagement;
