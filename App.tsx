
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Warehouse, UserCircle, Bell, MessageCircle, X, CheckCircle, ChevronRight, ReceiptText } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SalesWizard from './components/SalesWizard';
import CCRManagement from './components/CCRManagement';
import WarehouseView from './components/Warehouse';
import FinanceView from './components/Finance';
import Assistant from './components/Assistant';
import { ViewState, User } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setView('dashboard');
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setShowNotifications(false);
  };

  if (view === 'login' || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={navigateTo} user={user} />;
      case 'sales': return <SalesWizard user={user} />;
      case 'warehouse': return <WarehouseView onNavigate={navigateTo} user={user} />;
      case 'finance': return <FinanceView user={user} />;
      case 'inquiry': return (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pb-20">
              <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-white shadow-xl">
                 <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black">
                    {user.name.split(' ').map(n => n[0]).join('')}
                 </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
              <p className="text-slate-500 font-medium mb-1">{user.role === 'Agente' ? 'Agente Autorizado' : user.role === 'Regional' ? `Gerente ${user.region}` : user.role === 'Banco' ? `Oficial ${user.institution}` : 'Personal Credicard'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">ID: {user.id}</p>
              
              <div className="w-full max-w-xs space-y-3">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-95 transition-transform cursor-pointer">
                      <span className="text-sm font-bold text-slate-600">Email</span>
                      <span className="text-sm font-medium text-slate-400">{user.email}</span>
                  </div>
                  {user.institution && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-95 transition-transform cursor-pointer">
                        <span className="text-sm font-bold text-slate-600">Institución</span>
                        <span className="text-sm font-medium text-slate-400">{user.institution}</span>
                    </div>
                  )}
              </div>
              
              <button 
                onClick={() => { setView('login'); setUser(null); }} 
                className="mt-8 text-red-500 font-bold text-sm hover:underline"
              >
                  Cerrar Sesión
              </button>
          </div>
      );
      default: return null;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 active:scale-90 ${
        view === id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-500'
      }`}
    >
      <div className={`relative p-1.5 rounded-full transition-all ${view === id ? 'transform -translate-y-1' : ''}`}>
        <Icon size={24} strokeWidth={view === id ? 2.5 : 2} fill={view === id ? "currentColor" : "none"} className={view === id ? "opacity-20" : ""} />
        <Icon size={24} strokeWidth={view === id ? 2.5 : 2} className="absolute top-1.5 left-1.5" />
      </div>
      <span className={`text-[9px] font-black uppercase mt-1 transition-opacity ${view === id ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      
      <div className="w-full flex-1 flex flex-col relative overflow-hidden">
        
        <header className="bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20 border-b border-slate-100/50">
          <div onClick={() => navigateTo('dashboard')} className="cursor-pointer">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Fuerza <span className="text-blue-600">CCR</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role === 'Banco' ? user.institution : 'CredicardPOS'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-full border transition-colors ${showNotifications ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
            >
               <Bell size={20} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white cursor-pointer active:scale-90 transition-transform" onClick={() => navigateTo('inquiry')}>
                {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 relative bg-slate-50/50">
          <div className="w-full min-h-full">
             {renderContent()}
          </div>
        </main>

        <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-2 pb-safe-area-bottom z-40 h-[85px] flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Gestión" />
          {(user.role === 'Agente' || user.role === 'CCR') && (
            <NavItem id="sales" icon={ShoppingCart} label="Ventas" />
          )}
          {(user.role === 'Agente' || user.role === 'CCR' || user.role === 'Regional') && (
            <NavItem id="warehouse" icon={Warehouse} label="Almacén" />
          )}
          <NavItem id="finance" icon={ReceiptText} label="Facturas" />
          <NavItem id="inquiry" icon={UserCircle} label="Canal" />
        </nav>

        <button 
            onClick={() => setShowAssistant(true)}
            className="absolute bottom-24 right-5 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-30 active:scale-90 transition-transform"
        >
            <MessageCircle size={26} />
        </button>

        <Assistant isOpen={showAssistant} onClose={() => setShowAssistant(false)} currentView={view} />
      </div>
    </div>
  );
};

export default App;
