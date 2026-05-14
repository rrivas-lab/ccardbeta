
import React, { useState } from 'react';
import { 
  Package, Truck, Plus, Smartphone, MapPin, X, CheckCircle, 
  ShieldCheck, QrCode, ClipboardCheck, Search, AlertTriangle, 
  Scan, Clock, ArrowRightLeft, FileText, Send, Filter,
  Container, Layers, History, Settings, Receipt, Info, Bell
} from 'lucide-react';
import { InventoryItem, ViewState, User } from '../types';

const initialInventory: InventoryItem[] = [
  { id: 'POS-AX-101', model: 'PAX A920 Pro', type: 'POS', stock: 120, reserved: 15, isFixedAsset: true },
  { id: 'POS-N-202', model: 'Newland N910', type: 'POS', stock: 45, reserved: 8, isFixedAsset: true },
  { id: 'SIM-D-4G', model: 'SIM Digitel 4G', type: 'SIM', stock: 450, reserved: 60, isFixedAsset: false },
  { id: 'SIM-M-4G', model: 'SIM Movistar 4G', type: 'SIM', stock: 210, reserved: 12, isFixedAsset: false },
];

interface WarehouseProps {
  onNavigate: (view: ViewState) => void;
  user: User;
}

const Warehouse: React.FC<WarehouseProps> = ({ onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Define allowed tabs per role
  // [CRM DEF V.5] Tabs disponibles en módulo Almacén.
  // 'validate' (Validación Comercial) sólo lo aprueba/edita/rechaza Ventas (rol CCR en este prototipo).
  // 'stock' (Inventario) permite a Ventas (CCR) y a Inventario realizar asignación de equipos si el perfil lo permite.
  // 'odoo_report' (Reporte Diario Consolidado en Odoo) — periodicidad diaria, disponible al cierre de jornada.
  const warehouseTabs = [
    { id: 'request', label: 'Solicitud', roles: ['Agente', 'Regional', 'CCR', 'Logistica', 'Inventario'] },
    { id: 'validate', label: 'Validación', roles: ['CCR'] },
    { id: 'logistics', label: 'Operaciones', roles: ['Logistica', 'Inventario'] },
    { id: 'stock', label: 'Inventario', roles: ['Inventario', 'CCR', 'Logistica', 'Regional'] },
    { id: 'distribute', label: 'Distribución', roles: ['Agente', 'CCR'] },
    { id: 'odoo_report', label: 'Reporte Odoo', roles: ['CCR', 'Regional', 'Logistica', 'Inventario'] },
  ].filter(tab => tab.roles.includes(user.role));

  // Auto-select first tab if none selected
  if (!activeTab && warehouseTabs.length > 0) {
    setActiveTab(warehouseTabs[0].id);
  }

  const [requests, setRequests] = useState([
     { id: 'REQ-0524-01', item: 'PAX A920 Pro', qty: 5, operator: 'Digitel', simQty: 5, deliveryMethod: 'Pick up', status: 'pending', date: '11/05/2026', requester: 'Agente Rivas', history: [] },
     { id: 'REQ-0524-02', item: 'Newland N910', qty: 2, operator: 'Movistar', simQty: 2, deliveryMethod: 'Delivery', status: 'validated', date: '10/05/2026', requester: 'Gerente Regional', history: [] },
  ]);

  const [warehouses] = useState([
    { id: 'W-CEN-01', name: 'Almacén Central CCS', type: 'Central', region: 'Capital' },
    { id: 'W-EST-02', name: 'Regional Oriente', type: 'Regional', region: 'Oriente' },
    { id: 'W-OCC-03', name: 'Regional Occidente', type: 'Regional', region: 'Occidente' },
  ]);
  
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0].id);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [thresholds, setThresholds] = useState({ low: 20, critical: 10 });
  const [transferModal, setTransferModal] = useState<any | null>(null);

  const [validatingRequest, setValidatingRequest] = useState<any | null>(null);
  const [logisticsRequest, setLogisticsRequest] = useState<any | null>(null);
  const [validationAction, setValidationAction] = useState<'edit' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editForm, setEditForm] = useState({ qty: 0, simQty: 0 });

  const [requestForm, setRequestForm] = useState({
    modelId: '',
    qty: '',
    operator: 'Digitel',
    deliveryMethod: 'Pick up'
  });

  const [serials, setSerials] = useState([
    { id: 'SN-9912', model: 'PAX A920 Pro', warehouseId: 'W-CEN-01', status: 'available', operator: 'Digitel' },
    { id: 'SN-9913', model: 'PAX A920 Pro', warehouseId: 'W-CEN-01', status: 'available', operator: 'Digitel' },
    { id: 'SN-9914', model: 'PAX A920 Pro', warehouseId: 'W-CEN-01', status: 'blocked', operator: 'Digitel' },
    { id: 'SN-9915', model: 'PAX A920 Pro', warehouseId: 'W-EST-02', status: 'available', operator: 'Movistar' },
    { id: 'SN-9916', model: 'Newland N910', warehouseId: 'W-OCC-03', status: 'available', operator: 'Movistar' },
    { id: 'SN-9917', model: 'Newland N910', warehouseId: 'W-CEN-01', status: 'available', operator: 'Digitel' },
  ]);

  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [distributionView, setDistributionView] = useState<'selection' | 'transfer'>('selection');

  const handleBulkMove = () => {
    if (selectedSerials.length === 0 || !destWarehouseId) return;

    const warehouseName = warehouses.find(w => w.id === destWarehouseId)?.name;

    setSerials(prev => prev.map(s => 
        selectedSerials.includes(s.id) ? { ...s, warehouseId: destWarehouseId } : s
    ));

    alert(`Se han movido ${selectedSerials.length} equipos al almacén: ${warehouseName}. Auditoría registrada en SAP HANA y Odoo (mock). Movimiento sincronizado con AS/400.`);
    setSelectedSerials([]);
    setDestWarehouseId('');
    setDistributionView('selection');
  };

  const toggleSerialSelection = (id: string) => {
    setSelectedSerials(prev => 
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleCreateRequest = () => {
    if (!selectedItem || !requestForm.qty) return;

    const newRequest = {
        id: `REQ-0524-0${requests.length + 1}`,
        item: selectedItem.model,
        qty: parseInt(requestForm.qty),
        simQty: parseInt(requestForm.qty),
        operator: requestForm.operator,
        deliveryMethod: requestForm.deliveryMethod,
        status: 'pending',
        date: new Date().toLocaleDateString('es-VE'),
        requester: user.name,
        history: [{ date: new Date().toLocaleString(), action: 'Creación de Solicitud', user: user.name }]
    };

    setRequests([newRequest, ...requests]);
    alert("Solicitud enviada a SAP HANA. Esperando validación comercial por CCR.");
    setShowRequestModal(false);
    setRequestForm({ modelId: '', qty: '', operator: 'Digitel', deliveryMethod: 'Pick up' });
  };

  // [CRM DEF V.5] Validación Comercial.
  // Sólo el área de Ventas (rol CCR en este prototipo) puede aprobar, editar o rechazar
  // solicitudes de equipos de Bancos o Agentes en Odoo.
  // - La aprobación reserva stock.
  // - La edición permite modificar cantidades / modelos según disponibilidad real o límite del aliado.
  // - El rechazo exige motivo obligatorio.
  const handleApprove = (id: string) => {
    if (user.role !== 'CCR') {
      alert('Acción restringida: sólo el área de Ventas (CCR) puede aprobar solicitudes comerciales.');
      return;
    }
    setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'validated', stockReserved: true, history: [...r.history, { date: new Date().toLocaleString(), action: 'Aprobación Comercial · Stock Reservado', user: user.name }] } : r
    ));
    alert("Solicitud aprobada. Stock reservado en SAP HANA / Odoo (mock) y Operaciones Logísticas notificadas.");
  };

  const handleEditRequest = () => {
    if (!validatingRequest) return;
    // [CRM DEF V.5] Sólo Ventas (CCR) puede editar solicitudes comerciales.
    if (user.role !== 'CCR') {
      alert('Acción restringida: sólo el área de Ventas (CCR) puede editar solicitudes comerciales.');
      return;
    }
    setRequests(prev => prev.map(r => 
        r.id === validatingRequest.id ? { 
            ...r, 
            qty: editForm.qty, 
            simQty: editForm.simQty,
            history: [...r.history, { date: new Date().toLocaleString(), action: 'Edición en Validación', user: user.name }] 
        } : r
    ));
    alert("Solicitud editada exitosamente. Se ha notificado al solicitante.");
    setValidationAction(null);
    setValidatingRequest(null);
  };

  const handleRejectRequest = () => {
    // [CRM DEF V.5] Rechazo requiere motivo obligatorio y rol Ventas (CCR).
    if (!validatingRequest) return;
    if (user.role !== 'CCR') {
      alert('Acción restringida: sólo el área de Ventas (CCR) puede rechazar solicitudes comerciales.');
      return;
    }
    if (!rejectReason || rejectReason.trim().length < 5) {
      alert('Motivo obligatorio: debe describir el motivo del rechazo (mínimo 5 caracteres).');
      return;
    }
    setRequests(prev => prev.map(r => 
        r.id === validatingRequest.id ? { 
            ...r, 
            status: 'rejected', 
            rejectReason,
            history: [...r.history, { date: new Date().toLocaleString(), action: 'Rechazo Comercial', user: user.name, reason: rejectReason }] 
        } : r
    ));
    alert("Solicitud rechazada. El solicitante ha sido notificado.");
    setValidationAction(null);
    setValidatingRequest(null);
    setRejectReason('');
  };

  const handleLogisticsNotify = (id: string, method: string) => {
    const newStatus = method === 'Pick up' ? 'ready_for_pickup' : 'shipped';
    const actionLabel = method === 'Pick up' ? 'Notificación de Retiro Enviada' : 'Equipo Despachado';
    
    setRequests(prev => prev.map(r => 
        r.id === id ? { 
            ...r, 
            status: newStatus, 
            history: [...r.history, { date: new Date().toLocaleString(), action: actionLabel, user: user.name }] 
        } : r
    ));
    
    alert(`Notificación enviada al solicitante. Estado: ${actionLabel}`);
    setLogisticsRequest(null);
  };

  const renderStock = () => {
    const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
    
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        {/* Header con Info de SAP y Selector de Almacén */}
        <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black">Inventario SAP</h3>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 italic">Live Stream: SAP HANA · Odoo · AS/400 (mock)</p>
                        {(user.role === 'CCR' || user.role === 'Inventario') && (
                          <p className="text-[10px] text-emerald-300 font-bold mt-2">[CRM DEF V.5] Perfil habilitado para asignación directa de equipos y SIM disponibles.</p>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowThresholdSettings(true)}
                        className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                </div>
                
                <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1">
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ubicación Seleccionada</label>
                        <select 
                            value={selectedWarehouseId}
                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                        >
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Smartphone size={14} className="text-blue-400" />
                            <p className="text-[9px] text-slate-400 font-black uppercase">Equipos POS</p>
                        </div>
                        <p className="text-2xl font-black text-white leading-none">165 <span className="text-[10px] text-slate-500 font-bold uppercase ml-1 tracking-tighter">unidades</span></p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <QrCode size={14} className="text-indigo-400" />
                            <p className="text-[9px] text-slate-400 font-black uppercase">SIM Cards</p>
                        </div>
                        <p className="text-2xl font-black text-white leading-none">660 <span className="text-[10px] text-slate-500 font-bold uppercase ml-1 tracking-tighter">unidades</span></p>
                    </div>
                </div>
            </div>
        </div>

        {/* Buscador */}
        <div className="flex bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm mb-4 group focus-within:border-blue-200 transition-all">
            <Search size={18} className="text-slate-300 ml-1" />
            <input type="text" placeholder="Buscar modelos, seriales o chips..." className="bg-transparent border-none outline-none text-xs w-full px-3 font-semibold placeholder:text-slate-300" />
            <Filter size={18} className="text-slate-300 mr-1" />
        </div>

        {/* Alertas de Stock Crítico */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {initialInventory.filter(item => item.stock <= thresholds.low).map(alert => (
                <div key={`alert-${alert.id}`} className={`shrink-0 flex items-center gap-3 p-3 rounded-2xl border ${alert.stock <= thresholds.critical ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    <AlertTriangle size={16} />
                    <div className="pr-2">
                        <p className="text-[8px] font-black uppercase leading-none mb-0.5">{alert.stock <= thresholds.critical ? 'Crítico' : 'Stock Bajo'}</p>
                        <p className="text-[10px] font-bold truncate max-w-[80px]">{alert.model}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mt-4">Stock en Almacén Seleccionado</h4>
          {initialInventory.map((item) => {
            const isLow = item.stock <= thresholds.low;
            const isCritical = item.stock <= thresholds.critical;
            
            return (
              <div 
                key={item.id} 
                className="bg-white p-5 rounded-[32px] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => setTransferModal(item)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isCritical ? 'bg-red-50 text-red-600' : 
                      isLow ? 'bg-amber-50 text-amber-600' : 
                      item.type === 'POS' ? 'bg-blue-50 text-blue-600' : 
                      'bg-slate-50 text-slate-600'
                  }`}>
                    {item.type === 'POS' ? <Smartphone size={24} /> : <Receipt size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">{item.model}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-400 font-bold font-mono">{item.id}</span>
                      {item.isFixedAsset ? (
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Comodato</span>
                      ) : (
                        <span className="text-[8px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Consumible</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black leading-none ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>{item.stock}</p>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Disp. SAP</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Configuración de Umbrales */}
        {showThresholdSettings && (
            <div className="fixed inset-0 z-[70] flex items-end justify-center">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowThresholdSettings(false)}></div>
                <div className="bg-white w-full rounded-t-[40px] relative shadow-2xl animate-fade-in-up p-8 pb-12">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Parametrización Stock</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Alertas Automáticas Almacén</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Settings size={22} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Umbral Bajo (Min)</label>
                                <input 
                                    type="number" 
                                    value={thresholds.low}
                                    onChange={(e) => setThresholds({...thresholds, low: parseInt(e.target.value) || 0})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-amber-600 outline-none focus:border-amber-400" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Umbral Crítico</label>
                                <input 
                                    type="number" 
                                    value={thresholds.critical}
                                    onChange={(e) => setThresholds({...thresholds, critical: parseInt(e.target.value) || 0})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-red-600 outline-none focus:border-red-400" 
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                Estos valores definen cuándo los ítems se marcarán con colores de advertencia en el inventario global y regional.
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowThresholdSettings(false)}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                        >
                            Guardar Parametrización
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de Asignación Rápida (Ventas) */}
        {transferModal && (
            <div className="fixed inset-0 z-[70] flex items-end justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTransferModal(null)}></div>
                <div className="bg-white w-full rounded-t-[40px] relative shadow-2xl animate-fade-in-up p-8 pb-12">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Acción Directa Inventario</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{transferModal.model}</p>
                        </div>
                        <button onClick={() => setTransferModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3" onClick={() => alert('Acción de botón en Warehouse')}>
                            <Receipt size={16} /> Asignación Directa Ventas
                        </button>
                        <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3" onClick={() => alert('Acción de botón en Warehouse')}>
                            <ArrowRightLeft size={16} /> Transferencia entre Almacenes
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[9px] text-slate-400 text-center font-bold font-mono">ID SAP: {transferModal.id} • REGION: {activeWarehouse?.region}</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const renderRequest = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Solicitud de Equipos</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Genera una nueva solicitud de despacho. Todas las solicitudes de la Fuerza de Ventas deben ser validadas comercialmente por CCR.
        </p>
        
        <button 
          onClick={() => setShowRequestModal(true)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={16} /> Crear Nueva Solicitud
        </button>
      </div>

      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tus Solicitudes</h4>
         {requests.map(req => (
           <div key={req.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {req.status === 'pending' ? <Clock size={20} /> : <CheckCircle size={20} />}
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{req.item} (x{req.qty})</h5>
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {req.status === 'pending' ? 'Pendiente CCR' : req.status === 'rejected' ? 'Rechazado' : 'Validado'}
                   </span>
                </div>
                {req.status === 'rejected' && req.rejectReason && (
                    <p className="mt-1 text-[9px] text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100 font-medium italic">
                        Motivo: {req.rejectReason}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] text-slate-400 font-bold font-mono tracking-tighter">{req.id} • {req.date}</p>
                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        req.status === 'validated' ? 'bg-indigo-100 text-indigo-700' : 
                        'bg-green-100 text-green-700'
                    }`}>
                      {req.status === 'pending' ? 'Pendiente CCR' : 
                       req.status === 'rejected' ? 'Rechazado' : 
                       req.status === 'validated' ? 'Aprobado: En Preparación' : 
                       req.status === 'ready_for_pickup' ? 'Listo para Retiro' : 
                       req.status === 'shipped' ? 'Despachado' : 'Procesado'}
                    </span>
                </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );

  const renderValidate = () => (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
              <h3 className="text-xl font-black">Validación Comercial</h3>
              <p className="text-xs text-blue-100 mt-1 leading-tight">Supervisor CCR: Valide solicitudes pendientes para procedencia operativa.</p>
          </div>
      </div>

      <div className="space-y-3">
        {requests.filter(r => r.status === 'pending').map(req => (
          <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{req.requester}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{req.id} • {req.date}</p>
              </div>
              <span className="text-[10px] text-blue-600 font-black uppercase bg-blue-50 px-2 py-0.5 rounded">Pendiente</span>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase">Item solicitado</p>
                  <p className="text-sm font-bold text-slate-700">{req.item}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase">Cantidad</p>
                  <p className="text-sm font-bold text-slate-700">{req.qty} und.</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase">Operadora</p>
                  <p className="text-xs font-bold text-blue-600 uppercase">{req.operator}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase">Método Retiro</p>
                  <p className="text-xs font-bold text-slate-700 uppercase">{req.deliveryMethod}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleApprove(req.id)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Aprobar Solicitud
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setValidatingRequest(req); setValidationAction('edit'); setEditForm({ qty: req.qty, simQty: req.simQty || req.qty }); }}
                  className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Editar Cant.
                </button>
                <button 
                  onClick={() => { setValidatingRequest(req); setValidationAction('reject'); }}
                  className="py-3 bg-white border border-slate-200 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.filter(r => r.status === 'pending').length === 0 && (
            <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                    <ClipboardCheck size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400">No hay validaciones pendientes.</p>
            </div>
        )}
      </div>

      {/* Validation Modals */}
      {validationAction === 'reject' && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setValidationAction(null); setValidatingRequest(null); }}></div>
          <div className="bg-white w-full rounded-t-[32px] relative shadow-2xl animate-fade-in-up p-8">
            <h3 className="text-xl font-black text-slate-800 mb-6">Rechazar Solicitud</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Motivo de Rechazo (Obligatorio)</label>
                    <textarea 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Indique la causa del rechazo comercial..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-semibold text-slate-700 outline-none focus:border-red-500 min-h-[120px]"
                    ></textarea>
                </div>
                <button 
                    onClick={handleRejectRequest}
                    disabled={!rejectReason}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                >
                    Confirmar Rechazo
                </button>
            </div>
          </div>
        </div>
      )}

      {validationAction === 'edit' && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setValidationAction(null); setValidatingRequest(null); }}></div>
          <div className="bg-white w-full rounded-t-[32px] relative shadow-2xl animate-fade-in-up p-8">
            <h3 className="text-xl font-black text-slate-800 mb-6">Editar Solicitud</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad de POS</label>
                    <input 
                      type="number" 
                      value={editForm.qty}
                      onChange={(e) => setEditForm({...editForm, qty: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-xs font-bold outline-none border border-slate-100 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad de SIM Cards</label>
                    <input 
                      type="number" 
                      value={editForm.simQty}
                      onChange={(e) => setEditForm({...editForm, simQty: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-xs font-bold outline-none border border-slate-100 focus:border-blue-500" 
                    />
                </div>
                <button 
                    onClick={handleEditRequest}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                    Guardar Cambios y Notificar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLogistics = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 border-dashed text-center">
        <Container size={40} className="text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Operaciones Logísticas</h3>
        <p className="text-[10px] text-slate-500 font-medium max-w-[180px] mx-auto mt-1">Gestione solicitudes aprobadas, prepare despachos y asigne guías.</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cola de Trabajo (Aprobados)</h4>
        {requests.filter(r => r.status === 'validated').map(req => (
          <div key={req.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors" onClick={() => setLogisticsRequest(req)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{req.item} (x{req.qty})</h5>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Solicitado por: {req.requester}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase">{req.deliveryMethod}</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">{req.operator}</span>
                </div>
              </div>
            </div>
            <button className="p-2.5 bg-slate-900 text-white rounded-xl active:scale-90 transition-transform" onClick={() => alert('Acción de botón en Warehouse')}>
              <ArrowRightLeft size={16} />
            </button>
          </div>
        ))}

        {requests.filter(r => r.status === 'validated').length === 0 && (
            <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                    <Package size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400">No hay despachos pendientes.</p>
            </div>
        )}
      </div>

      {/* Logistics Detail Modal */}
      {logisticsRequest && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLogisticsRequest(null)}></div>
          <div className="bg-white w-full rounded-t-[40px] relative shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4 shrink-0"></div>
            
            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Preparación Despacho</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{logisticsRequest.id} • Validada por CCR</p>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Truck size={32} />
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalle de Autorización</h4>
                    <div className="grid grid-cols-2 gap-y-6">
                        <div>
                            <p className="text-[9px] font-black text-indigo-600 uppercase">Equipos POS</p>
                            <p className="text-sm font-bold text-slate-800">{logisticsRequest.item} (x{logisticsRequest.qty})</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-indigo-600 uppercase">SIM Cards</p>
                            <p className="text-sm font-bold text-slate-800">{logisticsRequest.simQty || logisticsRequest.qty} Unidades</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-600 uppercase">Operadora</p>
                            <p className="text-sm font-bold text-slate-800">{logisticsRequest.operator}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-indigo-600 uppercase">Forma Retiro</p>
                            <p className="text-sm font-bold text-slate-800 uppercase">{logisticsRequest.deliveryMethod}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Acción Logística</p>
                    <button 
                        onClick={() => handleLogisticsNotify(logisticsRequest.id, logisticsRequest.deliveryMethod)}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        {logisticsRequest.deliveryMethod === 'Pick up' ? (
                            <>
                                <Bell size={18} /> Notificar Listo para Retiro
                            </>
                        ) : (
                            <>
                                <Send size={18} /> Confirmar Envío / Despacho
                            </>
                        )}
                    </button>
                    
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                            Al confirmar, se enviará una notificación automática vía App y Correo al solicitante ({logisticsRequest.requester}).
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDistribute = () => {
    const availableSerials = serials.filter(s => s.status === 'available' && s.warehouseId === selectedWarehouseId);
    
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="bg-indigo-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                  <ArrowRightLeft size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Distribución Masiva</h3>
                  <p className="text-xs text-indigo-200 mt-1 uppercase tracking-widest font-black">Transferencia de Stock Regional</p>
                </div>
            </div>
        </div>

        {distributionView === 'selection' ? (
            <>
                <div className="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedSerials.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {selectedSerials.length}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seriales Seleccionados</p>
                    </div>
                    {selectedSerials.length > 0 && (
                        <button 
                            onClick={() => setDistributionView('transfer')}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                        >
                            Continuar Movimiento
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Disponibles en: {warehouses.find(w => w.id === selectedWarehouseId)?.name}</h4>
                    {availableSerials.length > 0 ? (
                        availableSerials.map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => toggleSerialSelection(s.id)}
                                className={`p-5 rounded-[28px] border transition-all flex items-center justify-between cursor-pointer ${selectedSerials.includes(s.id) ? 'bg-blue-50 border-blue-200 shadow-md translate-x-1' : 'bg-white border-slate-50 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSerials.includes(s.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                                        {selectedSerials.includes(s.id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{s.model}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono italic">{s.id}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{s.operator}</span>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4 font-black">
                                <Scan size={32} />
                            </div>
                            <p className="text-xs font-bold text-slate-400">No hay seriales disponibles en este almacén.</p>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">Confirmar Destino</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Moviendo {selectedSerials.length} equipos</p>
                    </div>
                    <button onClick={() => setDistributionView('selection')} className="p-2 bg-slate-50 text-slate-400 rounded-full"><X size={18} /></button>
                </div>

                <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Almacén Destinatario</label>
                        <select 
                            value={destWarehouseId}
                            onChange={(e) => setDestWarehouseId(e.target.value)}
                            className="bg-transparent w-full border-none outline-none text-xs font-black text-slate-800 uppercase tracking-tight appearance-none"
                        >
                            <option value="">Seleccione destino...</option>
                            {warehouses
                                .filter(w => w.id !== selectedWarehouseId)
                                .filter(w => user.role === 'CCR' || w.region === user.region || user.role === 'Inventario')
                                .map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.region})</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-1" />
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                            Esta operación requiere nivel de permiso <strong>{user.role}</strong>. Al confirmar, el inventario se actualizará inmediatamente en SAP HANA, Odoo y AS/400 (mock).
                        </p>
                    </div>

                    <button 
                        onClick={handleBulkMove}
                        disabled={!destWarehouseId}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-2xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Truck size={18} /> Confirmar Traslado Masivo
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  };

  // ====================================================================
  // [CRM DEF V.5] Reporte Diario Consolidado en Odoo (MOCK)
  // Periodicidad: diaria · Disponible al cierre de cada jornada.
  // Estructura mínima: banco, terminal, afiliado, vendedor, canal, región, fecha, estado.
  // ====================================================================
  const renderOdooReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const odooReportRows = [
      { banco: 'BNC', terminal: 'BN1452', afiliado: 'AFIL-8821 PANADERIA EL SOL', vendedor: 'Juan Poveda', canal: 'Venta Ordinaria', region: 'Metropolitana', fecha: today, estado: 'Operativo para Entrega' },
      { banco: 'Banca Amiga', terminal: 'BA0008', afiliado: 'AFIL-9001 BODEGA CENTRAL', vendedor: 'María Pérez', canal: 'Jornada', region: 'Capital', fecha: today, estado: 'En Programación' },
      { banco: 'Bancrecer', terminal: 'BC0021', afiliado: 'AFIL-7720 FERRETERIA LOS PINOS', vendedor: 'Carlos Lara', canal: 'Venta Ordinaria', region: 'Zulia', fecha: today, estado: 'Operativo para Entrega' },
      { banco: 'Banplus', terminal: 'BP0034', afiliado: 'AFIL-3310 FARMACIA SAN PABLO', vendedor: 'Andrea Soto', canal: 'Venta Ordinaria', region: 'Anzoátegui', fecha: today, estado: 'Pendiente Carga AS/400' },
      { banco: 'Banco de Venezuela', terminal: 'BV1789', afiliado: 'AFIL-1120 SUPERMERCADO CENTRAL', vendedor: 'Pedro Núñez', canal: 'Jornada', region: 'Zulia', fecha: today, estado: 'Operativo para Entrega' },
      { banco: 'Banco Caroní', terminal: 'BC2200', afiliado: 'AFIL-5505 PASTELERIA LA ROSA', vendedor: 'Andrea Soto', canal: 'Venta Ordinaria', region: 'Bolívar', fecha: today, estado: 'Operativo para Entrega' },
    ];
    const exportCsv = () => {
      const header = 'banco,terminal,afiliado,vendedor,canal,region,fecha,estado';
      const rows = odooReportRows.map(r => [r.banco,r.terminal,r.afiliado,r.vendedor,r.canal,r.region,r.fecha,r.estado].map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
      const blob = new Blob([header+'\n'+rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'odoo_reporte_diario_' + today + '.csv'; a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        <div className="bg-slate-900 p-6 rounded-[28px] text-white shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black">Reporte Diario Consolidado · Odoo (MOCK)</h3>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-1">Generado automáticamente · Cierre de jornada {today}</p>
              <p className="text-[10px] text-slate-300 mt-2 leading-relaxed max-w-md">
                Reporte consolidado por banco de los terminales creados por toda la fuerza de ventas.
                Periodicidad diaria. Disponible al cierre de cada jornada.
              </p>
            </div>
            <button onClick={exportCsv} className="px-3 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow active:scale-95 transition-transform shrink-0">Exportar CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50">
              <tr className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                <th className="px-3 py-2 text-left">Banco</th>
                <th className="px-3 py-2 text-left">Terminal</th>
                <th className="px-3 py-2 text-left">Afiliado</th>
                <th className="px-3 py-2 text-left">Vendedor</th>
                <th className="px-3 py-2 text-left">Canal</th>
                <th className="px-3 py-2 text-left">Región</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {odooReportRows.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-800">{r.banco}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{r.terminal}</td>
                  <td className="px-3 py-2 text-slate-600">{r.afiliado}</td>
                  <td className="px-3 py-2 text-slate-700">{r.vendedor}</td>
                  <td className="px-3 py-2 text-slate-700">{r.canal}</td>
                  <td className="px-3 py-2 text-slate-700">{r.region}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">{r.fecha}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[9px] uppercase tracking-widest">{r.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-[10px] text-blue-800 leading-relaxed">
          <strong>Fuente:</strong> Odoo (mock — sin integración real). Los datos se consolidan al cierre diario y se entregan en formato exportable.
          Estructura: banco · terminal · afiliado · vendedor · canal · región · fecha · estado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-[600px] pb-20">
      
      {/* Sub-Navigation for Warehouse */}
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {warehouseTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[70px] py-2 text-[8px] font-black uppercase tracking-tighter rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              {tab.label}
            </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'stock' && renderStock()}
        {activeTab === 'request' && renderRequest()}
        {activeTab === 'validate' && renderValidate()}
        {activeTab === 'logistics' && renderLogistics()}
        {activeTab === 'distribute' && renderDistribute()}
        {activeTab === 'odoo_report' && renderOdooReport()}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
          <div className="bg-white w-full rounded-t-[32px] relative shadow-2xl animate-fade-in-up p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Nueva Solicitud Almacén</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Modelo de Equipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {initialInventory.filter(i => i.type === 'POS').map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${selectedItem?.id === item.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                    >
                      <Smartphone size={20} />
                      <span className="text-[9px] font-black uppercase text-center leading-tight">{item.model}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad</label>
                <input 
                  type="number" 
                  value={requestForm.qty}
                  onChange={(e) => setRequestForm({...requestForm, qty: e.target.value})}
                  placeholder="0" 
                  className="w-full bg-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:bg-blue-50 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operadora</label>
                  <select 
                    value={requestForm.operator}
                    onChange={(e) => setRequestForm({...requestForm, operator: e.target.value})}
                    className="w-full bg-slate-100 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none focus:bg-blue-50 transition-colors"
                  >
                    <option value="Digitel">Digitel 4G</option>
                    <option value="Movistar">Movistar 4G</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retiro</label>
                  <select 
                    value={requestForm.deliveryMethod}
                    onChange={(e) => setRequestForm({...requestForm, deliveryMethod: e.target.value})}
                    className="w-full bg-slate-100 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none focus:bg-blue-50 transition-colors"
                  >
                    <option value="Pick up">Pick up Almacén</option>
                    <option value="Delivery">Envío Regional</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  Esta solicitud será cargada a su stock personal una vez sea validada comercialmente por el departamento CCR.
                </p>
              </div>

              <button 
                onClick={handleCreateRequest}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
              >
                Confirmar Solicitud SAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
