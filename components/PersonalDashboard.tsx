
import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, AlertCircle, Phone, 
  MessageSquare, Download, CheckCircle2, Clock, 
  ChevronRight, Filter, Target, Activity, 
  BarChart,
  LayoutGrid, List, User as UserIcon, Building2,
  AlertTriangle, Wrench, Ban, Search, Mail
} from 'lucide-react';
import { Bar, ResponsiveContainer, XAxis, Tooltip, BarChart as RechartsBarChart } from 'recharts';
import { User } from '../types';

interface ManagementLog {
  id: string;
  date: string;
  status: 'Pending' | 'Reported Failure' | 'Resolved';
  notes: string;
  user: string;
}

interface InactiveEquipment {
  id: string;
  clientName: string;
  rif: string;
  posModel: string;
  serial: string;
  daysInactive: number;
  phone: string;
  email: string;
  status: 'active' | 'risk' | 'critical';
  institution: string;
  managementHistory: ManagementLog[];
}

// [CRM DEF V.5] Configuración parametrizable de alertas de inactividad.
// Regla base: alerta automática si un equipo no registra transacciones en 15 días.
// 30 días pasa a ser escalamiento parametrizable (no la regla principal).
export const INACTIVITY_RULES = {
  alertAfterDays: 15,          // Regla base oficial
  escalationAfterDays: 30,     // Escalamiento parametrizable
  criticalAfterDays: 45        // Crítico (mantiene umbral histórico)
};

export const getInactivityStatus = (daysInactive: number): 'active' | 'risk' | 'critical' => {
  if (daysInactive >= INACTIVITY_RULES.criticalAfterDays) return 'critical';
  if (daysInactive >= INACTIVITY_RULES.alertAfterDays) return 'risk';
  return 'active';
};

const mockInactiveEquipments: InactiveEquipment[] = [
  {
    id: 'POS-001',
    clientName: 'Inversiones El Amanecer',
    rif: 'J-12345678-9',
    posModel: 'PAX A920 Pro',
    serial: 'SN-998877',
    daysInactive: 45,
    phone: '0414-1112233',
    email: 'amanecer@gmail.com',
    status: 'critical',
    institution: 'Banesco',
    managementHistory: [
      { id: 'L-001', date: '2024-05-01', status: 'Pending', notes: 'Visita agendada para revisión técnica.', user: 'Agente 01' }
    ]
  },
  {
    id: 'POS-002',
    clientName: 'Panadería La Central',
    rif: 'J-88223344-5',
    posModel: 'Newland N910',
    serial: 'SN-445566',
    daysInactive: 18,
    phone: '0412-5556677',
    email: 'lacentral@outlook.com',
    status: 'risk',
    institution: 'Banesco',
    managementHistory: []
  },
  {
    id: 'POS-003',
    clientName: 'Bodega San Judas',
    rif: 'J-99887766-1',
    posModel: 'PAX A50',
    serial: 'SN-112233',
    daysInactive: 32,
    phone: '0424-9998877',
    email: 'sanjudas_bodega@yahoo.com',
    status: 'critical',
    institution: 'Mercantil',
    managementHistory: []
  }
];

interface PersonalDashboardProps {
  user: User;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recovery' | 'management'>('overview');
  const [selectedEquipment, setSelectedEquipment] = useState<InactiveEquipment | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Reported Failure' | 'Resolved'>('Pending');
  const [newNotes, setNewNotes] = useState('');
  const [inactives, setInactives] = useState(mockInactiveEquipments);
  const [searchTerm, setSearchTerm] = useState('');

  // Visibility Filter
  const myInactives = inactives.filter(eq => {
    if (user.role === 'Agente') return true; // In mock, we assume all are theirs
    if (user.role === 'Banco') return eq.institution === user.institution;
    return true;
  }).filter(eq => eq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || eq.serial.includes(searchTerm));

  const handleUpdateStatus = () => {
    if (!selectedEquipment) return;
    
    const newEntry: ManagementLog = {
      id: `L-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: newStatus,
      notes: newNotes,
      user: user.name
    };

    const updatedInactives = inactives.map(eq => {
      if (eq.id === selectedEquipment.id) {
        return {
          ...eq,
          managementHistory: [newEntry, ...eq.managementHistory]
        };
      }
      return eq;
    });

    setInactives(updatedInactives);
    setSelectedEquipment({ ...selectedEquipment, managementHistory: [newEntry, ...selectedEquipment.managementHistory] });
    setIsManaging(false);
    setNewNotes('');
    alert('Gestión registrada exitosamente.');
  };

  const handleDownloadContact = (eq: InactiveEquipment) => {
    alert(`Auditoría: Acceso a datos de contacto de ${eq.clientName}. Registrando log de seguridad...`);
    alert(`Descargando vCard: ${eq.phone} / ${eq.email}`);
  };

  const handleSendMessage = (type: 'welcome' | 'alert') => {
    const msg = type === 'welcome' ? 'Enviando guía de uso y bienvenida...' : 'Enviando alerta de baja transaccionalidad...';
    alert(msg);
    setTimeout(() => alert('Mensaje enviado exitosamente vía WhatsApp/Mail (Simulado).'), 1000);
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Portfolio Behavior Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Cartera</p>
            <h3 className="text-3xl font-black text-slate-800">485</h3>
          </div>
          <div className="flex items-center flex-wrap gap-2">
             <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                <TrendingUp size={12} /> +15
             </div>
             <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                <TrendingDown size={12} /> -3
             </div>
             <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold">
                <Activity size={12} /> 467
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-[28px] shadow-xl text-white flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sin Transar</p>
            <h3 className="text-3xl font-black text-blue-400">42</h3>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">8.6% del total</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full w-[8.6%] shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Meta Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800">Meta de Recuperación</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asignada por CCR</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Target size={24} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-black text-slate-800">12 / 20</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Equipos Recuperados</p>
            </div>
            <span className="text-xl font-black text-blue-600">60%</span>
          </div>
          
          <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 bg-blue-600 h-full w-[60%] transition-all duration-1000"></div>
          </div>
        </div>

        <button className="mt-6 w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors" onClick={() => alert('Acción de botón en PersonalDashboard')}>
            Ver Plan de Trabajo <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Access to Risks */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Alertas de Cartera</h3>
            <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Críticos</span>
        </div>
        <div className="divide-y divide-slate-50">
           {myInactives.slice(0, 3).map(eq => (
             <div key={eq.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors" onClick={() => setSelectedEquipment(eq)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${eq.status === 'critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                    <AlertTriangle size={18} />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800">{eq.clientName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{eq.daysInactive} días sin uso</p>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
             </div>
           ))}
        </div>
        <button 
          onClick={() => setActiveTab('recovery')}
          className="p-4 w-full text-center text-xs font-bold text-blue-600 bg-slate-50/30 hover:bg-slate-50 transition-colors"
        >
          Ver todos los equipos (42)
        </button>
      </div>
    </div>
  );

  const renderRecovery = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center mb-2 px-1">
            <div>
                <h3 className="font-bold text-slate-800">Equipos Sin Transar</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Gestión de Campo · Alerta base {INACTIVITY_RULES.alertAfterDays}d · Escalamiento {INACTIVITY_RULES.escalationAfterDays}d</p>
            </div>
            <div className="flex gap-2">
                <button className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400" onClick={() => alert('Abriendo filtros (mock)')}><Filter size={16}/></button>
                <button className="p-2 bg-blue-600 rounded-xl shadow-lg text-white shadow-blue-200" onClick={() => alert('Cambiando vista (mock)')}><LayoutGrid size={16}/></button>
            </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Search size={16} className="text-slate-300 ml-1" />
            <input 
              type="text" 
              placeholder="Buscar por cliente o serial..." 
              className="bg-transparent border-none outline-none text-xs w-full py-1 font-medium placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="space-y-3">
            {myInactives.map(eq => (
                <div key={eq.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setSelectedEquipment(eq)}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${eq.status === 'critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{eq.clientName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{eq.posModel} • {eq.serial}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${eq.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {eq.daysInactive}d
                        </span>
                    </div>

                    {eq.managementHistory.length > 0 ? (
                        <div className="p-2.5 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${eq.managementHistory[0].status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{eq.managementHistory[0].status === 'Pending' ? 'Pendiente Visita' : eq.managementHistory[0].status === 'Reported Failure' ? 'Falla Reportada' : 'Resuelto'}</p>
                            </div>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{eq.managementHistory[0].notes}</p>
                        </div>
                    ) : (
                        <div className="p-2.5 bg-blue-50 border border-blue-100/50 rounded-xl mb-3 flex items-center gap-2">
                             <Clock size={12} className="text-blue-500" />
                             <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Sin Gestión Iniciada</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleSendMessage('alert'); }} 
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <MessageSquare size={12} /> Alertar
                        </button>
                        <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedEquipment(eq); }}
                             className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Activity size={12} /> Gestionar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full transform translate-x-12 -translate-y-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase bg-blue-600 px-2 py-0.5 rounded-md tracking-widest">{user.role} Dashboard</span>
            {user.institution && <span className="text-[9px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded-md tracking-widest">{user.institution}</span>}
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1">Mi Gestión Comercial</h2>
          <p className="text-slate-400 text-xs font-medium tracking-wide">Panel de control de cartera y objetivos.</p>
          <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block"></span>Fuente: Data Integriti (MOCK)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
        {[
          { id: 'overview', icon: LayoutGrid, label: 'Estatus' },
          { id: 'recovery', icon: Activity, label: 'Inactivos' },
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

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'recovery' && renderRecovery()}
      </div>

      {/* Equipment Detail & Management Drawer */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedEquipment(null)}></div>
          <div className="bg-white w-full rounded-t-[40px] relative shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4 shrink-0"></div>
            
            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedEquipment.clientName}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedEquipment.id} • {selectedEquipment.institution}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedEquipment.status === 'critical' ? 'bg-red-50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-orange-50 text-orange-500'}`}>
                        <AlertTriangle size={32} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Días Inactivo</p>
                        <p className="text-xl font-black text-red-600">{selectedEquipment.daysInactive}d</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Modelo POS</p>
                        <p className="text-sm font-black text-slate-700">{selectedEquipment.posModel}</p>
                    </div>
                </div>

                {/* Contact Data Card */}
                <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Información de Contacto</h4>
                        <button 
                            onClick={() => handleDownloadContact(selectedEquipment)}
                            className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Phone size={14}/></div>
                            <span className="text-xs font-bold text-blue-900">{selectedEquipment.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Mail size={14}/></div>
                            <span className="text-xs font-bold text-blue-900">{selectedEquipment.email}</span>
                        </div>
                    </div>
                </div>

                {!isManaging ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Historial de Gestión</h4>
                        <button 
                          onClick={() => setIsManaging(true)}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"
                        >
                          Registrar Nueva <Activity size={12} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {selectedEquipment.managementHistory.length > 0 ? selectedEquipment.managementHistory.map(log => (
                            <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${log.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {log.status === 'Pending' ? 'Pendiente' : log.status === 'Reported Failure' ? 'Falla' : 'Resuelto'}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300">{log.date}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{log.notes}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">Gestor: {log.user}</p>
                            </div>
                        )) : (
                            <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <Activity size={32} className="text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400 tracking-tight">Vacio. Inicie una gestión para recuperar el punto.</p>
                            </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Nueva Gestión de Campo</h4>
                        <button onClick={() => setIsManaging(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Estatus de Acción</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'Pending', label: 'Pendiente', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { id: 'Reported Failure', label: 'Falla', icon: Wrench, color: 'text-red-500', bg: 'bg-red-50' },
                                    { id: 'Resolved', label: 'Resuelto', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                                ].map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => setNewStatus(st.id as any)}
                                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${newStatus === st.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500'}`}
                                    >
                                        <st.icon size={18} />
                                        <span className="text-[9px] font-bold uppercase">{st.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones / Notas</label>
                            <textarea 
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                placeholder="Describa el resultado de la gestión técnica o comercial..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 transition-colors min-h-[120px]"
                            ></textarea>
                        </div>

                        <button 
                            onClick={handleUpdateStatus}
                            disabled={!newNotes}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            Guardar Gestión SAP
                        </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions for specific messages */}
                <div className="mt-10 flex gap-3">
                    <button 
                      onClick={() => handleSendMessage('welcome')}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Mail size={14} /> Bienvenida
                    </button>
                    <button 
                      onClick={() => handleSendMessage('alert')}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} /> Alerta Técnica
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDashboard;
