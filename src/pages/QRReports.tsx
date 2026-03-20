import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Ticket } from '../types';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  User, 
  Calendar,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function QRReports() {
  const navigate = useNavigate();
  const { tickets, updateTicket, deleteTicket, clients } = useStore();

  // Filter tickets that came from QR Codes (status PENDENTE_APROVACAO and have reportedBy)
  const qrReports = useMemo(() => {
    return tickets
      .filter(t => t.status === 'PENDENTE_APROVACAO' && t.reportedBy)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tickets]);

  const handleApprove = (ticket: Ticket) => {
    updateTicket(ticket.id, { ...ticket, status: 'APROVADO' });
  };

  const handleReject = (ticket: Ticket) => {
    updateTicket(ticket.id, { ...ticket, status: 'REJEITADO' });
  };

  const getClientName = (clientId?: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Desconhecido';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Relatos via QR Code</h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie as mensagens e problemas relatados pelos moradores</p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
          {qrReports.length} Pendentes
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {qrReports.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tudo em ordem!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Não há novos relatos pendentes de aprovação no momento.
            </p>
          </div>
        ) : (
          qrReports.map((report, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={report.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Photo Preview */}
                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
                  {report.photoBefore ? (
                    <img 
                      src={report.photoBefore} 
                      alt="Problema relatado" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-40">Sem Foto</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Pendente
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.date).toLocaleDateString('pt-BR')} {new Date(report.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        {getClientName(report.clientId)} • {report.location}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      Relato de {report.reportedBy}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{report.reportedProblem}"
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(report)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprovar e Criar OS
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/tickets/${report.id}`)}
                      className="text-gray-400 hover:text-primary transition-all flex items-center gap-1 text-sm font-bold"
                    >
                      Ver Detalhes
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
