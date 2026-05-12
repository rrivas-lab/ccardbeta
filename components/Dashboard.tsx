import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, ChevronRight, Activity, Wallet, Phone, Calendar, Users, Target, X, MapPin, Clock, FileText, Download, ClipboardList, CheckCircle2, HelpCircle, Wrench, Ban, MessageSquare, Navigation, ArrowUpRight, Briefcase } from 'lucide-react';
import { ViewState, User } from '../types';
import CCRManagement from './CCRManagement';
import PersonalDashboard from './PersonalDashboard';

const salesData = [
  { name: 'Sem 1', cierres: 4 },
  { name: 'Sem 2', cierres: 6 },
  { name: 'Sem 3', cierres: 3 },
  { name: 'Sem 4', cierres: 8 },
];

const portfolioData = [
  { name: 'Activos', value: 185, color: '#22c55e' }, // Green-500
  { name: 'Sin Uso', value: 45, color: '#f97316' }, // Orange-500
];

// Enhanced data structure to track management status
const initialRiskClients = [
    { id: 1, name: 'Inv. El Amanecer', days: 45, phone: '0414-1112233', debt: false, managed: false, address: 'Av. Bolivar, Local 2' },
    { id: 2, name: 'Panadería La Central', days: 32, phone: '0412-5556677', debt: true, managed: false, address: 'Calle Real, Esq. 4' },
    { id: 3, name: 'Bodega San Judas', days: 31, phone: '0424-9998877', debt: false, managed: false, address: 'Sector La Paz' },
    { id: 4, name: 'Farmacia Vital', days: 30, phone: '0416-2223344', debt: false, managed: false, address: 'CC Los Ruices' },
    { id: 5, name: 'Supermercado Luna', days: 30, phone: '0414-7771122', debt: true, managed: false, address: 'Av. Sucre' },
];

// Mock Data for CRM Opportunities
const crmOpportunities = [
    { id: 1, type: 'lead', name: 'Bodegón El Sol', status: 'Cierre en Proceso', probability: 'Alta', date: 'Hace 2h' },
    { id: 2, type: 'portfolio', name: 'Farmacia San José', status: 'Solicitud Insumos', probability: 'Media', date: 'Ayer' },
    { id: 3, type: 'lead', name: 'Restaurante La Plaza', status: 'Contactar', probability: 'Alta', date: 'Hoy' },
    { id: 4, type: 'portfolio', name: 'Inv. El Amanecer', status: 'Recuperación', probability: 'Alta', date: 'Hace 3d' },
    { id: 5, type: 'lead', name: 'Tienda Moda Plus', status: 'Enviado a Riesgo', probability: 'Baja', date: 'Hace 1d' },
];

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [riskClients, setRiskClients] = useState(initialRiskClients);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Filter content based on user role/region (simulated)
  const isBankUser = user.role === 'Banco';
  const isRegionalUser = user.role === 'Regional';
  
  const welcomeSubtext = isBankUser 
    ? `Cartera de ${user.institution} tiene un 92% de operatividad.`
    : isRegionalUser 
    ? `Región ${user.region} con un 78% de cumplimiento de meta.`
    : `Tu cartera tiene un 85% de operatividad.`;

  // Field Report States
  const [reportingClient, setReportingClient] = useState<any>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportAction, setReportAction] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleDownloadReport = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDownloading(true);
      setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleCall = (phone: string) => {
      alert(`Llamando a ${phone}...`);
  };

  const handleStartRoute = () => {
    if(!selectedVisit) return;
    setIsNavigating(true);
    // Simulate Opening Maps/Waze delay
    setTimeout(() => {
        setIsNavigating(false);
        setSelectedVisit(null);
    }, 2500);
  };

  const startReport = (client: any) => {
      setReportingClient(client);
      setReportReason('');
      setReportAction('');
      setReportNotes('');
      setReportSuccess(false);
  };

  const submitReport = () => {
      if(!reportReason || !reportAction) return;
      
      setIsSubmittingReport(true);
      
      setTimeout(() => {
          // Simulate CRM Update
          const updatedClients = riskClients.map(c => 
            c.id === reportingClient.id ? { ...c, managed: true } : c
          );
          setRiskClients(updatedClients);
          setIsSubmittingReport(false);
          setReportSuccess(true);
          
          // Close modal after delay
          setTimeout(() => {
              setReportingClient(null);
              setReportSuccess(false);
          }, 2500);
      }, 1500);
  };

  const getOpportunityTag = () => {
      if (reportReason === 'broken') return 'Ticket de Soporte';
      if (reportReason === 'training') return 'Oportunidad de Capacitación';
      if (reportReason === 'competitor') return 'Alerta de Competencia';
      if (reportReason === 'unused') return 'Logística / Retiro';
      return 'Nota General';
  };

  if (user.role === 'CCR') {
    return <CCRManagement user={user} />;
  }

  if (user.role === 'Agente' || user.role === 'Banco') {
    return <PersonalDashboard user={user} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-4 relative">
      
      {/* Welcome Message - Click to Profile */}
      <div 
        className="flex justify-between items-end px-1 cursor-pointer active:opacity-70 transition-opacity"
        onClick={() => onNavigate('inquiry')}
      >
        <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hola, {user.name.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500 font-medium">{welcomeSubtext}</p>
        </div>
        <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl border border-blue-100/50 shadow-sm">
            <Target size={24} />
        </div>
      </div>

      {/* Main Stats - Opportunities & Portfolio Health */}
      <div className="grid grid-cols-2 gap-3">
        {/* CRM Opportunities Card - CLICKABLE */}
        <div 
            onClick={() => setShowOpportunities(true)}
            className={`p-4 rounded-[24px] shadow-lg flex flex-col justify-between h-40 relative overflow-hidden text-white cursor-pointer active:scale-95 transition-transform ${isBankUser ? 'bg-indigo-900 shadow-indigo-100' : 'bg-slate-900 shadow-slate-200'}`}
        >
             <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2 z-10 backdrop-blur-sm">
                <Users size={20} className="text-white" />
             </div>
             <div className="z-10">
                <div className="flex justify-between items-center">
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Gestión CRM</p>
                    <ArrowUpRight size={14} className="text-slate-400" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                    <h2 className="text-3xl font-black">{isBankUser ? '42' : '18'}</h2>
                    <span className="text-xs font-medium text-slate-400">{isBankUser ? user.institution : 'Total'}</span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                     <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        <span className="text-[10px] text-slate-300">{isBankUser ? '28 Activos' : '12 Nuevos Leads'}</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        <span className="text-[10px] text-slate-300">{isBankUser ? '14 Inactivos' : '6 Gestiones Cartera'}</span>
                     </div>
                </div>
             </div>
        </div>

        {/* Portfolio Health Card - Now Clickable to Risk Modal */}
        <div 
            onClick={() => setShowRiskModal(true)}
            className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden cursor-pointer active:scale-95 transition-transform group hover:border-orange-200"
        >
             <div className="absolute top-2 right-2">
                 <p className="text-[10px] text-slate-400 font-bold uppercase text-right group-hover:text-orange-500 transition-colors">Estatus POS</p>
             </div>
             
             <div className="h-20 w-full relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={portfolioData}
                            innerRadius={25}
                            outerRadius={35}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {portfolioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-slate-700">230</span>
                </div>
             </div>

             <div className="z-10 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Activos</span>
                    <span>185</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Sin Uso</span>
                    <span>45</span>
                </div>
             </div>
        </div>
      </div>

      {/* Critical Alert - Portfolio Management */}
      <div 
        className="bg-orange-50 border border-orange-100 rounded-[24px] p-5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => setShowRiskModal(true)}
      >
        <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                    <AlertTriangle size={20} className="text-orange-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Puntos de Venta Sin Uso</h3>
                    <p className="text-[11px] text-slate-500">Gestión de Campo Requerida</p>
                </div>
            </div>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg">Urgente</span>
        </div>
        <div className="mt-3 relative z-10">
            <p className="text-slate-600 text-xs leading-relaxed">
                Detectamos <span className="font-bold text-slate-800">{riskClients.filter(c => !c.managed).length} equipos</span> con transacción cero (0). Visita al cliente, indaga el motivo y reporta para generar la oportunidad.
            </p>
        </div>
        <button 
            className="mt-3 w-full bg-white text-orange-600 py-2.5 rounded-xl text-xs font-bold shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
         onClick={() => alert('Acción de botón en Dashboard')}>
            Gestionar Inactividad <ChevronRight size={14} />
        </button>
      </div>

      {/* Sales Chart - Clickable to Profile/Inquiry */}
      <div 
        onClick={() => onNavigate('inquiry')}
        className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-slate-800">Rendimiento de Cierres</h3>
                <p className="text-xs text-slate-400">Ventas vs Metas</p>
            </div>
            <button 
                onClick={handleDownloadReport}
                className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-blue-600 active:scale-95 transition-transform"
            >
                {isDownloading ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={20} />}
            </button>
        </div>
        <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <Tooltip 
                    cursor={{fill: '#f1f5f9', radius: 8}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <Bar dataKey="cierres" fill="#3B82F6" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Agenda (Visits) */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-5 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Agenda de Visitas</h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">Hoy</span>
         </div>
         <div className="divide-y divide-slate-50">
            {[
                { title: 'Farmacia San José', desc: 'Cierre de venta (Lead)', time: '09:00 AM', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50', address: 'Av. Bolívar, Centro' },
                { title: 'Bodegón El Centro', desc: 'Instalación de equipo', time: '11:30 AM', icon: Wallet, color: 'text-green-500', bg: 'bg-green-50', address: 'CC Las Américas, PB' },
                { title: 'Inversiones ABC', desc: 'Gestión Inactividad', time: '03:00 PM', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50', address: 'Zona Industrial II' },
            ].map((item, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setSelectedVisit(item)}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:bg-slate-100 cursor-pointer"
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{item.time}</span>
                </div>
            ))}
         </div>
      </div>

      {/* OPPORTUNITIES MODAL (New) */}
      {showOpportunities && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOpportunities(false)}></div>
            <div className="bg-slate-50 w-full h-[85vh] rounded-t-[32px] relative shadow-2xl animate-fade-in-up overflow-hidden flex flex-col">
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Oportunidades en Curso</h3>
                        <p className="text-xs text-blue-500 font-medium">Pipeline Activo</p>
                    </div>
                    <button onClick={() => setShowOpportunities(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {/* Summary Chips */}
                    <div className="flex gap-2 mb-2">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex-1 text-center">
                            12 Leads Nuevos
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold flex-1 text-center">
                            6 Cartera
                        </div>
                    </div>

                    {crmOpportunities.map((op) => (
                        <div 
                            key={op.id} 
                            onClick={() => onNavigate('sales')} // Clicking an opportunity goes to sales flow
                            className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 hover:border-blue-200 transition-colors active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${op.type === 'lead' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{op.type === 'lead' ? 'Lead' : 'Cartera'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{op.date}</span>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 text-base mb-1">{op.name}</h4>
                            <p className="text-xs text-slate-500 font-medium mb-3">{op.status}</p>

                            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Probabilidad:</span>
                                    <span className={`text-[10px] font-bold ${op.probability === 'Alta' ? 'text-green-600' : op.probability === 'Media' ? 'text-yellow-600' : 'text-red-500'}`}>
                                        {op.probability}
                                    </span>
                                </div>
                                <button className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg" onClick={() => alert('Acción de botón en Dashboard')}>
                                    Gestionar
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="p-4 text-center">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700" onClick={() => alert('Ver historial completo')}>Ver historial completo</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* RISK CLIENTS MODAL */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRiskModal(false)}></div>
            <div className="bg-slate-50 w-full h-[85vh] rounded-t-[32px] relative shadow-2xl animate-fade-in-up overflow-hidden flex flex-col">
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Cartera en Riesgo</h3>
                        <p className="text-xs text-orange-500 font-medium">POS con 0 transacciones</p>
                    </div>
                    <button onClick={() => setShowRiskModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {riskClients.map((client, i) => (
                        <div key={i} className={`p-4 rounded-[20px] shadow-sm border transition-all ${client.managed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{client.name}</h4>
                                {client.managed ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Gestionado
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">{client.days} días sin uso</span>
                                )}
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                <MapPin size={12}/> {client.address}
                            </p>

                            {client.debt && (
                                <div className="flex items-center gap-1.5 mb-3 bg-red-50 p-2 rounded-lg">
                                    <AlertTriangle size={12} className="text-red-500"/>
                                    <span className="text-[11px] text-red-500 font-medium">Posee deuda administrativa</span>
                                </div>
                            )}

                            {!client.managed && (
                                <div className="flex gap-2 mt-3">
                                    <button 
                                        onClick={() => handleCall(client.phone)}
                                        className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <Phone size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => startReport(client)}
                                        className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform border border-orange-100 hover:bg-orange-100"
                                    >
                                        <ClipboardList size={14}/> Gestionar / Reportar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* REPORT FORM MODAL (Field Intelligence) */}
      {reportingClient && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportingClient(null)}></div>
               <div className="bg-white w-full rounded-t-[32px] relative shadow-2xl animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {reportSuccess ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center h-[350px]">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Reporte Enviado!</h3>
                            <div className="bg-slate-50 p-4 rounded-2xl mt-4 w-full">
                                <p className="text-sm text-slate-500 mb-2">Acciones automáticas:</p>
                                <ul className="text-xs text-left space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-500"/> Oportunidad creada en CRM: <span className="font-bold">{getOpportunityTag()}</span></li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-500"/> Notificación enviada a Gerencia</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-500"/> Cliente actualizado en Dashboard</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Reporte de Campo</h3>
                                    <p className="text-xs text-slate-500">Auditoría: {reportingClient.name}</p>
                                </div>
                                <button onClick={() => setReportingClient(null)} className="p-2 bg-white rounded-full text-slate-400"><X size={20}/></button>
                            </div>
                            
                            <div className="p-6 space-y-6 overflow-y-auto pb-safe-area-bottom">
                                {/* Question 1: Reason */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">¿Cuál es el motivo de no uso?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {id: 'broken', label: 'Equipo Dañado', icon: Wrench},
                                            {id: 'competitor', label: 'Usa Competencia', icon: Activity},
                                            {id: 'unused', label: 'Comercio Cerrado', icon: Ban},
                                            {id: 'training', label: 'No sabe usarlo', icon: HelpCircle},
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setReportReason(opt.id)}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${reportReason === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}
                                            >
                                                <opt.icon size={20} />
                                                <span className="text-xs font-bold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question 2: Action Taken */}
                                {reportReason && (
                                    <div className="animate-fade-in space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Acción Tomada en Sitio</label>
                                            <select 
                                                value={reportAction}
                                                onChange={(e) => setReportAction(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">Selecciona una acción...</option>
                                                <option value="ticket">Crear Ticket de Soporte</option>
                                                <option value="training">Re-capacitación realizada</option>
                                                <option value="negotiation">Negociación de Tasa</option>
                                                <option value="retrieval">Solicitud de Retiro de Equipo</option>
                                                <option value="promise">Compromiso de reactivación</option>
                                            </select>
                                        </div>

                                        {/* Notes Field (From Audio Requirement) */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                Notas de Visita <MessageSquare size={12}/>
                                            </label>
                                            <textarea
                                                value={reportNotes}
                                                onChange={(e) => setReportNotes(e.target.value)}
                                                placeholder="Describe detalles importantes para la Gerencia (ej. 'Cliente molesto por tasas', 'Local en remodelación')..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors min-h-[80px]"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Auto-generated Opportunity Preview */}
                                {reportAction && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 animate-fade-in">
                                        <Activity className="text-blue-600 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="font-bold text-blue-800 text-sm">Sincronización CRM</h4>
                                            <p className="text-xs text-blue-700 leading-tight mt-1">
                                                Esta gestión se clasificará como <strong>{getOpportunityTag()}</strong> y será visible para el equipo de supervisión.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={submitReport}
                                    disabled={!reportReason || !reportAction || isSubmittingReport}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    {isSubmittingReport ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Registrar Gestión en CRM'}
                                </button>
                            </div>
                        </>
                    )}
               </div>
          </div>
      )}

      {/* Visit Detail Modal (View Only) */}
      {selectedVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedVisit(null)}></div>
              <div className="bg-white w-full max-w-sm rounded-[32px] p-6 relative shadow-2xl animate-fade-in-up">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${selectedVisit.bg} ${selectedVisit.color}`}>
                        <selectedVisit.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedVisit.title}</h3>
                  <p className="text-slate-500 font-medium mb-6">{selectedVisit.desc}</p>
                  
                  <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Clock size={18} className="text-slate-400"/>
                          <span className="font-bold">{selectedVisit.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                          <MapPin size={18} className="text-slate-400"/>
                          <span>{selectedVisit.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                          <FileText size={18} className="text-slate-400"/>
                          <span>Historial: 3 visitas previas</span>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setSelectedVisit(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cerrar</button>
                      <button 
                        onClick={handleStartRoute}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
                      >
                        Iniciar Ruta
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Navigation Overlay */}
      {isNavigating && selectedVisit && (
          <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse relative">
                  <div className="absolute w-full h-full rounded-full border-4 border-white/20 animate-ping"></div>
                  <Navigation size={48} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Navegando...</h2>
              <div className="text-center px-10">
                  <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Destino</p>
                  <p className="text-xl font-bold">{selectedVisit.title}</p>
                  <p className="text-slate-500 mt-2">{selectedVisit.address}</p>
              </div>
              <div className="absolute bottom-12 text-xs text-slate-500 font-mono">
                  Calculando ruta óptima...
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;