import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  QrCode, 
  Plus, 
  Trash2, 
  Download, 
  Building2, 
  MapPin,
  ExternalLink,
  Printer,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { Modal } from '../components/Modal';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { generatePdf } from '../utils/pdfGenerator';
import { toast } from 'react-hot-toast';

export default function QRManager() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const bulkPrintRef = useRef<HTMLDivElement>(null);
  const { clients, updateClient, companyLogo, companyData, tickets } = useStore();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [printingLocation, setPrintingLocation] = useState<{ id: string, name: string } | null>(null);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const clientReports = useMemo(() => {
    if (!selectedClientId) return [];
    return tickets
      .filter(t => t.clientId === selectedClientId && t.reportedBy)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tickets, selectedClientId]);

  const stats = useMemo(() => {
    if (!selectedClient) return { total: 0, active: 0, pending: 0 };
    return {
      total: (selectedClient.locations || []).length,
      active: (selectedClient.locations || []).length,
      pending: clientReports.filter(r => r.status === 'PENDENTE_APROVACAO').length
    };
  }, [selectedClient, clientReports]);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newLocationName.trim()) return;

    const newLocation = {
      id: uuidv4(),
      name: newLocationName.trim()
    };

    const updatedLocations = [...(selectedClient.locations || []), newLocation];
    updateClient(selectedClientId, { ...selectedClient, locations: updatedLocations });
    setNewLocationName('');
    setIsModalOpen(false);
    toast.success('Local adicionado com sucesso!');
  };

  const handleDeleteLocation = (locationId: string) => {
    if (!selectedClient) return;
    const updatedLocations = (selectedClient.locations || []).filter(l => l.id !== locationId);
    updateClient(selectedClientId, { ...selectedClient, locations: updatedLocations });
    toast.success('Local removido.');
  };

  const downloadQRCode = (locationId: string, locationName: string) => {
    const svg = document.getElementById(`qr-${locationId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${selectedClient?.name}-${locationName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintTemplate = async (locationId: string, locationName: string) => {
    setPrintingLocation({ id: locationId, name: locationName });
    
    setTimeout(async () => {
      if (!printRef.current) return;
      
      try {
        toast.loading('Gerando placa de impressão...', { id: 'printing' });
        await generatePdf(printRef.current, `PLACA-QR-${selectedClient?.name}-${locationName}.pdf`, 'a5');
        toast.success('Placa gerada com sucesso!', { id: 'printing' });
      } catch (error) {
        console.error(error);
        toast.error('Erro ao gerar placa.', { id: 'printing' });
      } finally {
        setPrintingLocation(null);
      }
    }, 100);
  };

  const handlePrintAll = async () => {
    if (!selectedClient || !selectedClient.locations || selectedClient.locations.length === 0) return;

    try {
      toast.loading('Gerando folhas de impressão...', { id: 'printing-all' });
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!bulkPrintRef.current) throw new Error('Template de impressão não encontrado');
      await generatePdf(bulkPrintRef.current, `QR-CODES-LOTE-${selectedClient.name}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'printing-all' });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF em lote.', { id: 'printing-all' });
    }
  };

  const getPublicUrl = (clientId: string, locationId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/report?client=${clientId}&location=${locationId}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative selection:bg-cyan-500/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-8">
          <BackButton />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Management Center</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              QR <span className="text-cyan-400">Studio</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/qr-reports')}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border border-white/10 backdrop-blur-xl group active:scale-95"
          >
            <MessageSquare className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm uppercase tracking-widest font-black">Relatos</span>
          </button>
          
          <div className="relative group">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 outline-none focus:border-cyan-500/50 transition-all min-w-[280px] text-white backdrop-blur-xl appearance-none cursor-pointer font-bold text-sm uppercase tracking-widest"
            >
              <option value="" className="bg-[#0a0a0a]">Selecionar Condomínio</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-[#0a0a0a]">{client.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto">
        {!selectedClientId ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <QrCode className="w-12 h-12 text-cyan-400" />
                )}
              </div>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-4 italic">Pronto para Gerar?</h3>
              <p className="text-white/40 max-w-md mx-auto text-lg font-medium leading-relaxed">
                Selecione um condomínio no menu superior para começar a gerenciar e criar novos pontos de acesso via QR Code.
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-6">Quick Stats</span>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/60">Total Condomínios</span>
                    <span className="text-2xl font-black italic">{clients.length}</span>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/60">Total QR Codes</span>
                    <span className="text-2xl font-black italic text-cyan-400">
                      {clients.reduce((acc, c) => acc + (c.locations?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <h4 className="text-xl font-black uppercase italic mb-2">Suporte 24/7</h4>
                <p className="text-sm text-cyan-400/70 font-bold leading-relaxed">
                  Precisa de ajuda com a configuração dos seus QR Codes? Nossa equipe está pronta para ajudar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Localização Atual</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                  {selectedClient?.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6 backdrop-blur-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Zoom</span>
                  <input 
                    type="range" 
                    min="100" 
                    max="400" 
                    step="10"
                    value={qrSize} 
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-32 accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-black text-cyan-400 w-10">{qrSize}px</span>
                </div>

                <button
                  onClick={handlePrintAll}
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 border border-white/10 backdrop-blur-xl active:scale-95"
                >
                  <Printer className="w-5 h-5 text-cyan-400" />
                  Imprimir Lote
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Novo Local
                </button>
              </div>
            </div>

            {/* Stats Mirror */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Pontos', value: stats.total, icon: MapPin, color: 'text-white' },
                { label: 'Ativos', value: stats.active, icon: Smartphone, color: 'text-cyan-400' },
                { label: 'Impressos', value: stats.total, icon: Printer, color: 'text-emerald-400' },
                { label: 'Relatos Pendentes', value: stats.pending, icon: MessageSquare, color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-white/10 transition-colors" />
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                  <div className="flex items-end justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
                    <span className="text-3xl font-black italic leading-none">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            {clientReports.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Atividade Recente</span>
                  </div>
                  <button 
                    onClick={() => navigate('/qr-reports')}
                    className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Ver Todos
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clientReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          {new Date(report.date).toLocaleDateString('pt-BR')}
                        </span>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          report.status === 'PENDENTE_APROVACAO' ? 'bg-amber-500/20 text-amber-400' :
                          report.status === 'APROVADO' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {report.status === 'PENDENTE_APROVACAO' ? 'Pendente' : 
                           report.status === 'APROVADO' ? 'Aprovado' : 'Rejeitado'}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{report.location}</h4>
                      <p className="text-xs text-white/40 italic line-clamp-2">"{report.reportedProblem}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(selectedClient?.locations || []).map(loc => (
                <div key={loc.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl hover:bg-white/10 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-8 relative group/qr">
                      <div className="absolute inset-0 bg-cyan-500/20 blur-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <QRCodeSVG 
                          id={`qr-${loc.id}`}
                          value={getPublicUrl(selectedClientId, loc.id)}
                          size={qrSize}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-8 w-full">
                      <h3 className="text-2xl font-black uppercase tracking-tight italic mb-2 truncate">{loc.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-tighter">
                        <Smartphone className="w-3 h-3" />
                        ID: {loc.id.slice(0,8)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button
                        onClick={() => handlePrintTemplate(loc.id, loc.name)}
                        className="py-4 rounded-2xl bg-white text-black hover:bg-cyan-400 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Placa
                      </button>
                      <button
                        onClick={() => downloadQRCode(loc.id, loc.name)}
                        className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-white/10"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </button>
                    </div>
                    
                    <a
                      href={getPublicUrl(selectedClientId, loc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-cyan-500/20"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Testar Acesso
                    </a>
                  </div>
                </div>
              ))}

              {(selectedClient?.locations || []).length === 0 && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 backdrop-blur-sm">
                  <QrCode className="w-16 h-16 text-white/10 mx-auto mb-6" />
                  <p className="text-white/20 text-2xl font-black uppercase tracking-widest italic">Nenhum local configurado</p>
                  <p className="text-white/10 text-sm font-bold mt-2">Adicione o primeiro local para gerar o sistema de QR Codes.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Ponto de Acesso"
        maxWidth="sm"
      >
        <form onSubmit={handleAddLocation} className="space-y-6 p-4">
          <div>
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Identificação do Local</label>
            <input
              required
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Ex: Elevador Social, Garagem G1..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-white font-bold placeholder:text-white/10"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 text-white/40 font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Criar Ponto
            </button>
          </div>
        </form>
      </Modal>

      {/* Modern QR Code Print Template (Hidden) */}
      <div className="hidden">
        <div ref={printRef} className="w-[148mm] h-[210mm] bg-white relative flex flex-col p-12 font-sans overflow-hidden text-zinc-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -mr-16 -mt-16 border border-zinc-100" />
          <div className="flex justify-between items-start mb-16 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Suporte Técnico</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-none uppercase">
                {companyData?.name || 'FLORES'}
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Manutenção Predial</p>
            </div>
            <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex items-center justify-center p-4 shadow-sm">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-zinc-200" />
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
            <div className="mb-10">
              <h2 className="text-6xl font-black tracking-tighter leading-[0.85] mb-6 italic">
                RELATE UM<br />PROBLEMA
              </h2>
              <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-6" />
              <p className="text-zinc-500 text-sm font-medium max-w-[240px] leading-relaxed mx-auto">
                Escaneie o código abaixo para abrir um chamado de manutenção para este local.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-zinc-100 rounded-tl-3xl" />
              <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-zinc-100 rounded-tr-3xl" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-zinc-100 rounded-bl-3xl" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-zinc-100 rounded-br-3xl" />
              <div className="bg-white p-8 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-zinc-50">
                {printingLocation && (
                  <QRCodeCanvas 
                    value={getPublicUrl(selectedClientId, printingLocation.id)}
                    size={320}
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-16 pt-10 border-t border-zinc-100 flex justify-between items-end relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2">Identificação do Local</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{printingLocation?.name || 'Local'}</h3>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">{selectedClient?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex gap-1.5 mb-3">
                {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-100" />)}
              </div>
              <span className="text-[9px] font-mono text-zinc-300 tracking-tighter uppercase">ID: {printingLocation?.id.slice(0,8)}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 flex">
            <div className="flex-1 bg-zinc-100" />
            <div className="flex-1 bg-blue-600" />
            <div className="flex-1 bg-zinc-900" />
          </div>
        </div>
      </div>

      {/* Bulk Print Template */}
      <div className="hidden">
        <div ref={bulkPrintRef} className="w-[210mm] bg-white text-zinc-900 font-sans">
          {selectedClient?.locations && Array.from({ length: Math.ceil(selectedClient.locations.length / 4) }).map((_, pageIndex) => (
            <div key={pageIndex} className="w-[210mm] h-[297mm] grid grid-cols-2 grid-rows-2 p-[10mm] gap-[10mm] page-break-after-always">
              {selectedClient.locations?.slice(pageIndex * 4, (pageIndex * 4) + 4).map((loc) => (
                <div key={loc.id} className="border border-zinc-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white shadow-sm">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-50 rounded-bl-full -mr-8 -mt-8 border border-zinc-100" />
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-2">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-8 h-8 text-zinc-200" />
                      )}
                    </div>
                    <h4 className="text-[8px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                      {companyData?.name || 'FLORES MANUTENÇÃO'}
                    </h4>
                  </div>
                  <div className="bg-white p-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-50 relative z-10">
                    <QRCodeCanvas 
                      value={getPublicUrl(selectedClientId, loc.id)}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="w-full relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Localização</span>
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight leading-none mb-1">
                      {loc.name}
                    </h3>
                    <p className="text-[7px] text-zinc-300 mt-2 font-mono truncate px-4 uppercase">
                      ID: {loc.id.slice(0,8)}
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1.5 flex">
                    <div className="flex-1 bg-zinc-100" />
                    <div className="flex-1 bg-blue-600" />
                    <div className="flex-1 bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
