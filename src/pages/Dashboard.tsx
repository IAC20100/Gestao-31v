import { useStore } from '../store';
import { TicketStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  Users, FileText, Plus, Hammer, 
  DollarSign, TrendingUp, Package, Database, 
  Calendar as CalendarIcon, CloudSun, Image as ImageIcon,
  Settings, Moon, Sun, UserPlus, Sun as SunIcon,
  Columns, Clock, ClipboardCheck, AlertCircle, QrCode, AlertTriangle,
  BarChart3, Droplets, Zap, ShieldCheck, Megaphone,
  Box, UserCheck, Activity, Maximize2, CheckCircle2, Presentation, LogOut,
  X, Download, FileUp, Database as DatabaseIcon, MessageSquare, Target,
  Wifi, WifiOff, GripVertical, ClipboardList, LayoutList
} from 'lucide-react';
import { KanbanMirror } from '../components/KanbanMirror';
import { TicketsMirror } from '../components/TicketsMirror';
import { SavingsMirror } from '../components/SavingsMirror';
import { CostsMirror } from '../components/CostsMirror';
import { ReceiptsMirror } from '../components/ReceiptsMirror';
import { QuotesMirror } from '../components/QuotesMirror';
import { WaterManagementMirror } from '../components/WaterManagementMirror';
import { MonitoringMirror } from '../components/MonitoringMirror';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TileData {
  id: string;
  type: 'wide' | 'square';
  component: React.ReactNode;
}

function SortableTile({ 
  id, 
  children, 
  className, 
  onResize, 
  onClose, 
  isEditMode
}: { 
  id: string, 
  children: React.ReactNode, 
  className: string, 
  onResize: (e: React.MouseEvent) => void, 
  onClose: (e: React.MouseEvent) => void, 
  isEditMode: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: !isEditMode 
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} relative group transition-all duration-300 ${
        isEditMode ? 'hover:ring-4 hover:ring-white/30 hover:ring-inset hover:scale-[1.02] hover:z-40 hover:shadow-2xl cursor-grab active:cursor-grabbing' : ''
      }`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Edit Controls - Only visible on hover when in edit mode */}
      {isEditMode && (
        <>
          {/* Drag Handle Icon - Visual cue */}
          <div 
            className="absolute top-2 left-2 p-2 bg-black/80 text-white rounded-xl z-50 shadow-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResize(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 bg-black/80 hover:bg-black text-white rounded-xl transition-all border border-white/20 shadow-xl active:scale-90"
              title="Alterar Tamanho"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl transition-all border border-white/20 shadow-xl active:scale-90"
              title="Ocultar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {children}
    </div>
  );
}

function WeatherTile() {
  const [data, setData] = useState<{ temp: number; city: string; condition: string; high: number; low: number } | null>(null);

  useEffect(() => {
    async function fetchLiveWeather() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-22.9064&longitude=-43.1822&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        
        const getWeatherCondition = (code: number) => {
          if (code === 0) return 'Céu Limpo';
          if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
          if (code >= 45 && code <= 48) return 'Nevoeiro';
          if (code >= 51 && code <= 55) return 'Chuvisco';
          if (code >= 61 && code <= 65) return 'Chuva';
          if (code >= 80 && code <= 82) return 'Pancadas de Chuva';
          if (code >= 95) return 'Tempestade';
          return 'Nublado';
        };

        setData({
          temp: Math.round(json.current.temperature_2m),
          city: 'Rio de Janeiro',
          condition: getWeatherCondition(json.current.weather_code),
          high: Math.round(json.daily.temperature_2m_max[0]),
          low: Math.round(json.daily.temperature_2m_min[0])
        });
      } catch (e) {
        console.error('Weather fetch error', e);
        // Fallback data for Rio de Janeiro
        setData({
          temp: 26,
          city: 'Rio de Janeiro',
          condition: 'Parcialmente Nublado',
          high: 30,
          low: 22
        });
      }
    }
    fetchLiveWeather();
  }, []);

  return (
    <Link to="/weather" className="w-full h-full bg-gradient-to-br from-[#0078d7] to-[#005a9e] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="absolute top-2 right-2 z-20">
        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6 h-full relative z-10">
        <div className="relative group-hover:scale-110 transition-transform duration-500 shrink-0">
          <SunIcon className="w-10 h-10 md:w-16 md:h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
          <CloudSun className="w-6 h-6 md:w-10 md:h-10 text-white absolute -bottom-1 -right-1 drop-shadow-lg" />
        </div>
        <div className="min-w-0">
          <span className="text-3xl md:text-5xl font-light drop-shadow-lg">{data ? `${data.temp}°` : '--°'}</span>
          <div className="mt-0.5 md:mt-1 min-w-0">
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-wider drop-shadow-md truncate">{data?.city || 'Carregando...'}</p>
            <p className="text-[8px] md:text-xs opacity-80 drop-shadow-sm truncate">{data?.condition || '...'}</p>
            {data && <p className="text-[8px] md:text-[10px] opacity-60">{data.high}° / {data.low}°</p>}
          </div>
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Clima</span>
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    clients, tickets, products, receipts, costs, quotes,
    appointments, companyLogo, restoreData, theme, 
    toggleTheme, scheduledMaintenances, addNotification,
    notifications, supplyItems, payments, notices,
    packages, visitors, criticalEvents, energyData, logout,
    hiddenTiles, toggleTileVisibility, companySignature, companyData,
    assemblies, savingsGoals, consumptionReadings,
    tileSizes: storeTileSizes,
    tileOrder: storeTileOrder,
    setTileSizes: updateStoreTileSizes,
    setTileOrder: updateStoreTileOrder
  } = useStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);
  
  const openTickets = tickets.filter(t => t.status !== 'CONCLUIDO').length;
  const pendingApprovalCount = tickets.filter(t => t.status === 'PENDENTE_APROVACAO').length;
  const lowStockCount = supplyItems.filter(item => item.currentStock <= item.minStock).length;
  const totalDelinquency = payments.filter(p => p.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  const overdueMaintenances = useMemo(() => {
    return scheduledMaintenances.filter(m => {
      if (!m.nextDate) return false;
      const isOverdue = new Date(m.nextDate) < new Date();
      return isOverdue;
    }).length;
  }, [scheduledMaintenances]);

  // Check for overdue maintenances and notify
  useEffect(() => {
    const overdueItems = scheduledMaintenances.filter(m => {
      if (!m.nextDate) return false;
      const isOverdue = new Date(m.nextDate) < new Date();
      return isOverdue;
    });

    overdueItems.forEach(item => {
      const client = clients.find(c => c.id === item.clientId);
      const notificationId = `overdue-${item.id}-${item.nextDate}`;
      
      // Only add if not already notified for this specific item/date
      if (!notifications.some(n => n.message.includes(item.item) && n.message.includes(client?.name || ''))) {
        addNotification({
          title: 'Manutenção Atrasada!',
          message: `${item.item} em ${client?.name} venceu em ${new Date(item.nextDate).toLocaleDateString('pt-BR')}`,
          type: 'WARNING'
        });
      }
    });
  }, [scheduledMaintenances, clients, addNotification]);

  const totalReceitas = receipts.reduce((acc, curr) => acc + curr.value, 0);
  const totalDespesas = costs.reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalDespesas;
  const nextAppointment = useMemo(() => {
    const future = appointments
      .filter(a => a.start && new Date(a.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return future[0] || appointments[0];
  }, [appointments]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initialTiles: TileData[] = [
    {
      id: 'tickets',
      type: 'wide',
      component: (
        <div 
          onClick={() => navigate('/tickets')}
          className="w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 cursor-pointer"
        >
          <TicketsMirror 
            tickets={tickets} 
            className="!p-4 !bg-transparent !border-none !shadow-none !rounded-none w-full h-full" 
            showLabel={true}
          />
        </div>
      )
    },
    {
      id: 'clients',
      type: 'square',
      component: (
        <Link to="/clients" className="w-full h-full bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Users className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">Clientes</span>
            <span className="text-xl sm:text-2xl font-light drop-shadow-lg shrink-0">{clients.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'products',
      type: 'square',
      component: (
        <Link to="/products" className="w-full h-full bg-gradient-to-br from-[#7e3878] to-[#632c5e] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Package className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">Produtos</span>
            <span className="text-xl sm:text-2xl font-light drop-shadow-lg shrink-0">{products.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'receipts',
      type: 'square',
      component: (
        <Link to="/receipts" className="w-full h-full bg-gradient-to-br from-[#f0a30a] to-[#d38b00] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <FileText className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">Recibos</span>
            <span className="text-xl sm:text-2xl font-light drop-shadow-lg shrink-0">{receipts.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'quotes',
      type: 'wide',
      component: (
        <div 
          onClick={() => navigate('/quotes')}
          className="w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 cursor-pointer"
        >
          <QuotesMirror 
            quotes={quotes} 
            clients={clients}
            className="!p-4 !bg-transparent !border-none !shadow-none !rounded-none w-full h-full" 
            showLabel={true}
          />
        </div>
      )
    },
    {
      id: 'financial',
      type: 'wide',
      component: (
        <div className="w-full h-full bg-slate-900/40 backdrop-blur-2xl p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 transition-all">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 grid grid-cols-2 gap-4 relative z-10 overflow-hidden">
            <div 
              className="flex flex-col justify-center border-r border-white/10 pr-4 cursor-pointer hover:bg-white/5 rounded-xl transition-all group/fin" 
              onClick={() => navigate('/financial')}
            >
              <CostsMirror 
                costs={costs} 
                className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full" 
                hideFooter={true}
              />
              <div className="mt-2">
                <p className="text-[8px] font-black uppercase text-white/40 mb-0.5 tracking-widest">Saldo Atual</p>
                <span className="text-sm font-black text-white group-hover/fin:text-emerald-400 transition-colors">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(saldo)}
                </span>
              </div>
            </div>

            <div 
              className="flex flex-col justify-center pl-4 cursor-pointer hover:bg-white/5 rounded-xl transition-all group/goals" 
              onClick={() => navigate('/financial')}
            >
              <SavingsMirror 
                goals={savingsGoals} 
                className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full" 
                hideFooter={true}
              />
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase text-white/40 mb-0.5 tracking-widest">Metas & Projetos</p>
                  <span className="text-sm font-black text-white group-hover/goals:text-amber-400 transition-colors">
                    {savingsGoals.filter(g => g.status === 'COMPLETED').length} / {savingsGoals.length}
                  </span>
                </div>
                <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30 group-hover/goals:scale-110 transition-transform">
                  <Target className="w-3 h-3 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="p-1.5 md:p-2 bg-white/10 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md truncate">Financeiro & Metas</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[6px] md:text-[8px] font-bold text-white/50 uppercase tracking-widest truncate">Gestão Unificada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'calendar',
      type: 'wide',
      component: (
        <Link to="/calendar" className="w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
            <div className="p-1.5 md:p-3 bg-white/10 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
              <CalendarIcon className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[8px] md:text-[10px] font-black uppercase text-white/50 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Agenda</p>
              {nextAppointment ? (
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-black text-xs md:text-xl truncate text-white leading-tight">{nextAppointment.title}</p>
                  <div className="flex items-center gap-1.5 md:gap-2 text-white/60">
                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                    <p className="text-[10px] md:text-sm font-medium truncate">
                      {nextAppointment.start ? (
                        <>
                          {new Date(nextAppointment.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(nextAppointment.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : (
                        'Horário não definido'
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] md:text-xs italic text-white/40 mt-1">Sem compromissos</p>
              )}
            </div>
          </div>
          <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/40">Calendário</span>
        </Link>
      )
    },
    {
      id: 'intelligent-checklist',
      type: 'wide',
      component: (
        <Link to="/intelligent-checklist" className="w-full h-full bg-gradient-to-br from-[#004a7c] to-[#002a4c] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
            <div className="p-1.5 md:p-3 bg-white/10 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
              <ClipboardCheck className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[8px] md:text-[10px] font-black uppercase text-white/70 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Manutenção Preventiva</p>
              <div className="space-y-0.5 md:space-y-1">
                <p className="font-black text-xs md:text-xl truncate text-white leading-tight">NBR 5674</p>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full overflow-hidden max-w-[60px] md:max-w-[100px]">
                    <div 
                      className={`h-full transition-all duration-1000 ${overdueMaintenances > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: overdueMaintenances > 0 ? '40%' : '100%' }}
                    />
                  </div>
                  <p className={`text-[8px] md:text-xs font-bold ${overdueMaintenances > 0 ? 'text-amber-400' : 'text-emerald-400'} truncate`}>
                    {overdueMaintenances > 0 ? `${overdueMaintenances} pendentes` : '100% em dia'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Manutenção Preventiva</span>
            <div className="flex items-center gap-1 md:gap-2 bg-white/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border border-white/10 shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" />
              <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-tight text-white/70">Conformidade Legal</span>
            </div>
          </div>
        </Link>
      )
    },
    {
      id: 'qr-codes',
      type: 'square',
      component: (
        <Link to="/qr-codes" className="w-full h-full bg-gradient-to-br from-[#00b7c3] to-[#008b94] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <QrCode className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">QR Codes</span>
            <span className="text-xl sm:text-2xl font-light drop-shadow-lg shrink-0">Gerir</span>
          </div>
        </Link>
      )
    },
    {
      id: 'qr-reports',
      type: 'wide',
      component: (
        <Link to="/qr-reports" className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 transition-all ${
          tickets.filter(t => t.status === 'PENDENTE_APROVACAO' && t.reportedBy).length > 0 
            ? 'bg-gradient-to-br from-amber-500 to-amber-700 animate-pulse-subtle' 
            : 'bg-gradient-to-br from-zinc-800 to-zinc-900'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
            <div className="p-1.5 md:p-3 bg-white/20 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
              <MessageSquare className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[8px] md:text-[10px] font-black uppercase text-white/70 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Relatos de Moradores</p>
              <div className="space-y-0.5 md:space-y-1">
                <p className="font-black text-xs md:text-xl truncate text-white leading-tight">Mensagens QR Code</p>
                <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
                  {tickets.filter(t => t.status === 'PENDENTE_APROVACAO' && t.reportedBy).length > 0 ? (
                    <>
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse shrink-0" />
                      <p className="text-[10px] md:text-sm font-bold text-white truncate">
                        {tickets.filter(t => t.status === 'PENDENTE_APROVACAO' && t.reportedBy).length} novos relatos
                      </p>
                    </>
                  ) : (
                    <p className="text-[10px] md:text-sm font-medium truncate">Nenhuma mensagem nova</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Gestão de Chamados</span>
        </Link>
      )
    },
    {
      id: 'approvals',
      type: 'wide',
      component: (
        <div className="w-full h-full bg-slate-900/40 backdrop-blur-2xl p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Reservatório de OS</h3>
                <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Últimas Realizadas</p>
              </div>
            </div>
            <Link to="/tickets" className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
              Ver Tudo
            </Link>
          </div>

          <div className="flex-1 space-y-1.5 relative z-10 overflow-hidden">
            {[...tickets]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 4)
              .map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/item"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      <span className="text-[7px] font-black text-white/30 uppercase">
                        {new Date(ticket.date).toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '')}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-white/80 truncate group-hover/item:text-white transition-colors">
                      {ticket.title || 'Sem título'}
                    </p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-wider shrink-0 bg-white/5 ${
                    ticket.status === 'CONCLUIDO' ? 'text-emerald-400' : 
                    ticket.status === 'REALIZANDO' || ticket.status === 'AGUARDANDO_MATERIAL' ? 'text-amber-400' : 
                    'text-orange-400'
                  }`}>
                    {ticket.status === 'CONCLUIDO' ? 'Conc.' : ticket.status === 'REALIZANDO' || ticket.status === 'AGUARDANDO_MATERIAL' ? 'Em And.' : 'Pend.'}
                  </div>
                </Link>
              ))}
            {tickets.length === 0 && (
              <p className="text-[10px] text-white/20 italic text-center py-4">Nenhuma OS registrada</p>
            )}
          </div>
          
          <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70 mt-2">Gestão de OS</span>
        </div>
      )
    },
    {
      id: 'kanban',
      type: 'wide',
      component: (
        <Link to="/kanban" className="w-full h-full bg-gradient-to-br from-[#60a917] to-[#4d8712] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            <KanbanMirror 
              tickets={tickets} 
              showLabel={false} 
              className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
            />
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="p-1.5 md:p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Columns className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md truncate">Kanban</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[6px] md:text-[8px] font-bold text-white/50 uppercase tracking-widest truncate">Mirror Live</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-black/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/10 backdrop-blur-md shrink-0">
              <span className="text-sm md:text-xl font-black drop-shadow-lg">{tickets.length}</span>
            </div>
          </div>
        </Link>
      )
    },
    {
      id: 'weather',
      type: 'wide',
      component: <WeatherTile />
    },
    {
      id: 'quick-actions',
      type: 'square',
      component: (
        <div className="w-full h-full  grid grid-cols-2 grid-rows-2 gap-1 perspective-1000">
          <Link to="/tickets/new" title="Nova OS" className="bg-gradient-to-br from-[#ee1111] to-[#cc0000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <Plus className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-90 transition-transform" />
          </Link>
          <Link to="/quotes" title="Novo Orçamento" className="bg-gradient-to-br from-[#ff0097] to-[#d4007d] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <FileText className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/clients" title="Novo Cliente" className="bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <UserPlus className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/financial" title="Novo Gasto" className="bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <DollarSign className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      )
    },
    {
      id: 'supplies',
      type: 'wide',
      component: (
        <Link to="/supplies" className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 transition-all ${
          lowStockCount > 0 
            ? 'bg-gradient-to-br from-red-500 to-red-700 animate-pulse-subtle' 
            : 'bg-gradient-to-br from-emerald-600 to-emerald-800'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
            <div className={`p-1.5 md:p-3 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0 ${
              lowStockCount > 0 ? 'bg-white/30' : 'bg-white/10'
            }`}>
              <Package className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[8px] md:text-[10px] font-black uppercase text-white/70 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Insumos</p>
              <div className="space-y-0.5 md:space-y-1">
                <p className="font-black text-xs md:text-xl truncate text-white leading-tight">Estoque</p>
                <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
                  {lowStockCount > 0 ? (
                    <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white/60 shrink-0" />
                  )}
                  <p className="text-[10px] md:text-sm font-bold truncate">
                    {lowStockCount > 0 ? `${lowStockCount} alertas` : 'Normal'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Materiais</span>
        </Link>
      )
    },
    {
      id: 'accountability',
      type: 'wide',
      component: (
        <div 
          onClick={() => navigate('/accountability')}
          className="w-full h-full bg-gradient-to-br from-[#4e44ce] to-[#3b3399] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            <CostsMirror 
              costs={costs} 
              className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
              hideFooter={true}
            />
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Central de Custos</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Fluxo em tempo real</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link 
                to="/receipts" 
                className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 px-2 py-1 rounded-lg border border-emerald-500/30 transition-colors group/btn"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="w-3 h-3 text-emerald-400 group-hover/btn:rotate-90 transition-transform" />
                <span className="text-[9px] font-black uppercase text-emerald-400">Adicionar Receita</span>
              </Link>
              <div className="flex flex-col items-end">
                <p className="text-[8px] font-black uppercase text-white/50 mb-0.5">Inadimplência</p>
                <div className="bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="text-sm font-black drop-shadow-lg text-white">R$ {totalDelinquency.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'received-receipts',
      type: 'square',
      component: (
        <Link to="/receipts" className="w-full h-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            <ReceiptsMirror 
              receipts={receipts} 
              className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full" 
              hideFooter={true}
            />
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md text-white">Receitas Recebidas</span>
            </div>
          </div>
        </Link>
      )
    },
    {
      id: 'consumption',
      type: 'wide',
      component: (
        <Link to="/consumption" className="w-full h-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-4 h-full relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Droplets className="w-10 h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Medição Individualizada</p>
              <div className="space-y-1">
                <p className="font-black text-xl truncate text-white leading-tight">Consumo Água & Gás</p>
                <div className="flex items-center gap-2 text-white/80">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <p className="text-sm font-bold text-yellow-300">Sensores IoT Ativos</p>
                </div>
              </div>
            </div>
          </div>
          <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Leitura em Tempo Real</span>
        </Link>
      )
    },
    {
      id: 'locker',
      type: 'square',
      component: (
        <Link to="/locker" className="w-full h-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Box className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex flex-col items-center relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Locker</span>
            <span className="text-3xl font-light drop-shadow-lg">{packages.filter(p => p.status === 'PENDING').length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'monitoring',
      type: 'wide',
      component: (
        <Link to="/monitoring" className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 transition-all ${
          criticalEvents.some(e => e.status === 'CRITICAL')
            ? 'bg-gradient-to-br from-red-600 to-red-800 animate-pulse-subtle'
            : 'bg-gradient-to-br from-[#10b981] to-[#059669]'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            <MonitoringMirror 
              showLabel={false} 
              className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
            />
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Controle Remoto</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Mirror Live</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Acionamento Rápido</span>
          </div>
        </Link>
      )
    },
    {
      id: 'settings',
      type: 'square',
      component: (
        <Link to="/settings" className="w-full h-full bg-gradient-to-br from-[#52525b] to-[#3f3f46] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Settings className="w-12 h-12 text-white drop-shadow-lg group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Ajustes</span>
        </Link>
      )
    },
    {
      id: 'document-factory',
      type: 'wide',
      component: (
        <Link to="/document-factory" className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-4 h-full relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Central de Documentos</p>
              <div className="space-y-1">
                <p className="font-black text-xl truncate text-white leading-tight">Central de Documentos</p>
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-bold text-white">Atas, Editais e Contratos</p>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Base Jurídica Completa</span>
        </Link>
      )
    },
    {
      id: 'system-presentation',
      type: 'wide',
      component: (
        <Link to="/presentation" className="w-full h-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-4 h-full relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Presentation className="w-10 h-10 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Apresentação</p>
              <div className="space-y-1">
                <p className="font-black text-xl truncate text-white leading-tight">Conheça o Sistema</p>
                <div className="flex items-center gap-2 text-white/80">
                  <Maximize2 className="w-4 h-4 text-yellow-300" />
                  <p className="text-sm font-bold text-white">Tour Interativo 19.0</p>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Experiência Completa</span>
        </Link>
      )
    },

    {
      id: 'water-management',
      type: 'wide',
      component: (
        <Link to="/consumption" className="w-full h-full bg-gradient-to-br from-[#2563eb] to-[#1e40af] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            <WaterManagementMirror 
              readings={consumptionReadings} 
              events={criticalEvents}
              className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
              hideFooter={true}
            />
          </div>

          <div className="flex justify-between items-end relative z-10 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md text-white">Gestão Hídrica</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Monitoramento Smart</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black uppercase text-white/50 mb-0.5">Alertas</p>
              <div className="bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                <span className="text-sm font-black drop-shadow-lg text-white">
                  {criticalEvents.filter(e => e.type === 'PUMP' && e.status !== 'NORMAL').length}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )
    },
    {
      id: 'demo-data',
      type: 'square',
      component: (
        <button onClick={() => setShowBackupModal(true)} className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-left">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <DatabaseIcon className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Backup / Demo</span>
        </button>
      )
    }
  ];

  const [tileSizes, setTileSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
  const [tiles, setTiles] = useState<TileData[]>(initialTiles);

  // Initialize tiles and sizes from store
  useEffect(() => {
    if (storeTileSizes && Object.keys(storeTileSizes).length > 0) {
      setTileSizes(storeTileSizes);
    }
  }, [storeTileSizes]);

  useEffect(() => {
    if (storeTileOrder && storeTileOrder.length > 0) {
      const orderedTiles = storeTileOrder
        .map(id => initialTiles.find(t => t.id === id))
        .filter(Boolean) as TileData[];
      
      // Add any new tiles that are not in the saved order
      const newTiles = initialTiles.filter(t => !storeTileOrder.includes(t.id));
      setTiles([...orderedTiles, ...newTiles]);
    } else {
      setTiles(initialTiles);
    }
  }, [storeTileOrder]);

  const handleResize = (id: string, defaultType: 'wide' | 'square', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSize = tileSizes[id] || (defaultType === 'wide' ? 'medium' : 'small');
    const nextSize: 'small' | 'medium' | 'large' = currentSize === 'small' ? 'medium' : currentSize === 'medium' ? 'large' : 'small';
    const newSizes = { ...tileSizes, [id]: nextSize };
    setTileSizes(newSizes);
    updateStoreTileSizes(newSizes);
  };

  // Sincronizar dados dinâmicos nos tiles quando o store mudar
  useEffect(() => {
    setTiles(prev => prev.map(tile => {
      const fresh = initialTiles.find(t => t.id === tile.id);
      return fresh ? { ...tile, component: fresh.component } : tile;
    }));
  }, [
    clients.length, tickets.length, products.length, receipts.length, 
    saldo, nextAppointment, notices.length, packages.length, 
    visitors.length, criticalEvents, energyData.length, supplyItems.length, payments.length, scheduledMaintenances.length,
    savingsGoals.length, costs.length, consumptionReadings.length
  ]);

  const handleExportBackup = () => {
    const backupData = {
      clients,
      checklistItems: useStore.getState().checklistItems,
      tickets,
      quotes: useStore.getState().quotes,
      receipts,
      costs,
      appointments,
      products,
      companyLogo,
      companySignature,
      companyData,
      hiddenTiles,
      version: '1.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_iac_tec_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowBackupModal(false);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (window.confirm('Atenção: Restaurar um backup irá substituir todos os dados atuais. Deseja continuar?')) {
            restoreData(json);
            setShowBackupModal(false);
          }
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          alert('Erro ao importar backup. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tiles.findIndex((item) => item.id === active.id);
      const newIndex = tiles.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(tiles, oldIndex, newIndex);
      setTiles(newItems);
      updateStoreTileOrder(newItems.map(t => t.id));
    }
  }

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-3 sm:p-8 md:p-12 bg-[#004a7c] text-white overflow-x-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-4 md:mb-12 flex justify-between items-start relative z-10 gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight text-white shrink-0">Iniciar</h1>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all w-fit ${
              isEditMode 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Columns className="w-3 h-3" />
            {isEditMode ? 'Salvar Layout' : 'Personalizar'}
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <button 
            onClick={toggleTheme}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white shrink-0"
          >
            {theme === 'dark' ? <SunIcon className="w-4 h-4 md:w-6 md:h-6" /> : <Moon className="w-4 h-4 md:w-6 md:h-6" />}
          </button>
          <div className="text-right min-w-0">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/20 mb-1 md:mb-2 ml-auto" />
            ) : (
              <div className="w-10 h-10 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center text-white/60 mb-1 md:mb-2 ml-auto">
                <Database className="w-5 h-5 md:w-8 md:h-8" />
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mb-1">
              {isSupabaseConfigured ? (
                <div className="flex items-center gap-1 bg-emerald-500/20 px-1 md:px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Wifi className="w-2 md:w-2.5 h-2 md:h-2.5 text-emerald-400" />
                  <span className="text-[6px] md:text-[9px] font-black text-emerald-400 uppercase tracking-wider">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-amber-500/20 px-1 md:px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  <WifiOff className="w-2 md:w-2.5 h-2 md:h-2.5 text-amber-400" />
                  <span className="text-[6px] md:text-[9px] font-black text-amber-400 uppercase tracking-wider">Local</span>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base md:text-xl font-medium text-white truncate">Administrador</p>
            <p className="text-[8px] md:text-sm text-white/60 font-medium truncate">IA COMPANY TEC</p>
            <button 
              onClick={logout}
              className="mt-1 text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 ml-auto group"
            >
              <LogOut className="w-2 h-2 md:w-2.5 md:h-2.5 group-hover:-translate-x-1 transition-transform" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tiles.map(t => t.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 relative z-10 max-w-[1400px] perspective-1000 grid-flow-dense">
            {tiles.filter(t => !hiddenTiles.includes(t.id)).map((tile) => {
              const currentSize = tileSizes[tile.id] || (tile.type === 'wide' ? 'medium' : 'small');
              const sizeClasses = currentSize === 'small' ? 'col-span-1 row-span-1 aspect-square' :
                                  currentSize === 'medium' ? 'col-span-2 row-span-1 aspect-[2/1] sm:aspect-video md:aspect-[2/1]' :
                                  'col-span-2 row-span-2 aspect-square';
              return (
                <SortableTile 
                  key={tile.id} 
                  id={tile.id} 
                  className={sizeClasses}
                  isEditMode={isEditMode}
                  onResize={(e) => handleResize(tile.id, tile.type, e)}
                  onClose={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTileVisibility(tile.id);
                  }}
                >
                  {tile.component}
                </SortableTile>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backup e Sistema</h3>
              <button onClick={() => setShowBackupModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={handleExportBackup}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
              >
                <Download className="w-6 h-6" />
                <div>
                  <p className="text-left">Gerar Backup Completo</p>
                  <p className="text-xs font-normal opacity-70">Baixe todos os dados para outro PC</p>
                </div>
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={backupInputRef}
                  onChange={handleImportBackup}
                />
                <button 
                  onClick={() => backupInputRef.current?.click()}
                  className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
                >
                  <FileUp className="w-6 h-6" />
                  <div>
                    <p className="text-left">Restaurar Backup</p>
                    <p className="text-xs font-normal opacity-70">Carregar arquivo .json</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
