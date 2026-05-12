import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, Fingerprint, ChevronDown } from 'lucide-react';
import { User, Role } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('juan.p@credicard.com');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<Role>('Agente');
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const getMockUser = (selectedRole: Role): User => {
    switch (selectedRole) {
      case 'Banco':
        return { id: 'BNC-001', name: 'Oficial Banesco', email: 'vargas.j@banesco.com', role: 'Banco', institution: 'Banesco' };
      case 'CCR':
        return { id: 'CCR-001', name: 'Coord. Regional', email: 'perez.m@credicard.com', role: 'CCR' };
      case 'Regional':
        return { id: 'REG-001', name: 'Gerente Occidente', email: 'lopez.r@credicard.com', role: 'Regional', region: 'Occidente' };
      case 'Agente':
      default:
        return { id: 'AGT-8821', name: 'Juan Poveda', email: 'juan.p@credicard.com', role: 'Agente' };
    }
  };

  const performLogin = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onLogin(getMockUser(role));
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
        performLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white text-slate-800 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-blue-700 to-blue-600 rounded-b-[50px] z-0 shadow-xl"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative z-10 w-full flex flex-col items-center mt-20 text-white animate-fade-in-up">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6 transform rotate-6 border-4 border-white/20">
             <div className="text-blue-600 font-black text-4xl">C</div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">CredicardPOS</h1>
        <p className="text-blue-100 mt-2 text-sm font-medium tracking-wide bg-blue-800/30 px-4 py-1 rounded-full backdrop-blur-sm">Portal de Agentes</p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-sm px-8 pb-12 relative z-10 flex-1 flex flex-col justify-end">
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] space-y-5 border border-white/50 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          
          <div className="space-y-4">
            {/* Role Simulation (Prototype Only) */}
            <div className="relative">
                <button 
                    type="button"
                    onClick={() => setShowRoleSelector(!showRoleSelector)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 flex justify-between items-center text-xs font-bold text-blue-600 transition-all active:scale-[0.98]"
                >
                    <span className="flex items-center gap-2">Perfil: {role}</span>
                    <ChevronDown size={14} className={`transition-transform ${showRoleSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showRoleSelector && (
                    <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                        {(['Agente', 'Banco', 'CCR', 'Regional'] as Role[]).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => { setRole(r); setShowRoleSelector(false); }}
                                className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 transition-colors ${role === r ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-colors">
                  <UserIcon size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-16 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Usuario"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-colors">
                  <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-16 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
             onClick={() => alert('Ingresar')}>
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <>
                        <span className="relative z-10">Ingresar</span> 
                        <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center absolute right-4">
                            <ArrowRight size={16} />
                        </div>
                    </>
                )}
            </button>
          </div>

          <div className="text-center pt-2">
            <button 
                type="button" 
                onClick={performLogin}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-colors active:scale-95"
            >
                <Fingerprint size={20} />
                Ingresar con FaceID
            </button>
          </div>
        </form>
      </div>
      
      <div className="text-center text-[10px] text-slate-300 pb-6 relative z-10 font-medium">
        v3.0.1 Mobile Release
      </div>
    </div>
  );
};

export default Login;