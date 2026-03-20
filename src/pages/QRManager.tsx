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
  const { clients, updateClient, companyLogo, companyData } = useStore();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [qrSize, setQrSize] = useState(150);
  const [printingLocation, setPrintingLocation] = useState<{ id: string, name: string } | null>(null);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

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
  };

  const handleDeleteLocation = (locationId: string) => {
    if (!selectedClient) return;
    const updatedLocations = (selectedClient.locations || []).filter(l => l.id !== locationId);
    updateClient(selectedClientId, { ...selectedClient, locations: updatedLocations });
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
    
    // Wait for state update and DOM render
    setTimeout(async () => {
      if (!printRef.current) return;
      
      try {
        toast.loading('Gerando placa de impressão...', { id: 'printing' });
        // Use A5 format for the single plate
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
      toast.loading('Gerando folhas de impressão (4 por página)...', { id: 'printing-all' });
      
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!bulkPrintRef.current) throw new Error('Template de impressão não encontrado');
      
      await generatePdf(bulkPrintRef.current, `QR-CODES-LOTE-${selectedClient.name}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'printing-all' });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF em lote.', { id: 'printing-all' });
    }
  };

  // Construct the public URL for the ticket form
  const getPublicUrl = (clientId: string, locationId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/report?client=${clientId}&location=${locationId}`;
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <BackButton />
          <div>
            <h1 className="text-6xl font-light tracking-tight">QR Codes</h1>
            <p className="text-xl opacity-60 mt-2 font-light">Gestão de pontos de acesso</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/qr-reports')}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-amber-500/30 shadow-lg active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            Gerenciar Relatos
          </button>
          
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all min-w-[250px] text-white backdrop-blur-md"
          >
            <option value="" className="bg-[#004a7c]">Selecionar Cliente/Condomínio</option>
            {clients.map(client => (
              <option key={client.id} value={client.id} className="bg-[#004a7c]">{client.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="relative z-10">
        {!selectedClientId ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-md">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-10 h-10 text-white/40" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">Selecione um cliente</h3>
            <p className="text-white/50 max-w-md mx-auto">
              Escolha um condomínio para gerenciar os pontos de acesso via QR Code.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-light flex items-center gap-3">
                <MapPin className="w-8 h-8 text-white/40" />
                Locais em {selectedClient?.name}
              </h2>
              <div className="flex items-center gap-4">
                {(selectedClient?.locations || []).length > 0 && (
                  <button
                    onClick={handlePrintAll}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 border border-emerald-500/30 shadow-lg active:scale-95"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir Todos (4 por folha)
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 border border-white/20 shadow-lg active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Local
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <label className="text-sm font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Tamanho do QR Code:</label>
              <input 
                type="range" 
                min="100" 
                max="500" 
                step="10"
                value={qrSize} 
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full max-w-xs accent-white"
              />
              <span className="text-xl font-light w-16">{qrSize}px</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(selectedClient?.locations || []).map(loc => (
                <div key={loc.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/10 transition-all group">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-white/10 shadow-2xl flex justify-center items-center overflow-hidden">
                      <QRCodeSVG 
                        id={`qr-${loc.id}`}
                        value={getPublicUrl(selectedClientId, loc.id)}
                        size={qrSize}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold">{loc.name}</h3>
                      <p className="text-[10px] text-white/30 mt-2 break-all px-4 font-mono">
                        {getPublicUrl(selectedClientId, loc.id)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full pt-4">
                      <button
                        onClick={() => handlePrintTemplate(loc.id, loc.name)}
                        className="flex-1 py-3 rounded-xl bg-white text-[#004a7c] hover:bg-white/90 transition-all font-bold flex items-center justify-center gap-2 text-xs active:scale-95"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir Placa
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => downloadQRCode(loc.id, loc.name)}
                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold flex items-center justify-center gap-2 text-xs border border-white/10 active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </button>
                      <a
                        href={getPublicUrl(selectedClientId, loc.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/10 hover:bg-blue-500 text-white transition-all border border-white/10 active:scale-95"
                        title="Testar Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-3 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-all border border-white/10 text-red-400 hover:text-white active:scale-95"
                        title="Excluir Local"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(selectedClient?.locations || []).length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                  <p className="text-white/30 text-xl font-light">Nenhum local cadastrado. Adicione o primeiro local para gerar QR Codes.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Local para QR Code"
        maxWidth="sm"
      >
        <form onSubmit={handleAddLocation} className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Local</label>
            <input
              required
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Ex: Elevador Social 1, Salão de Festas, Garagem G1..."
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-gray-500 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-xl font-bold transition-all"
            >
              Adicionar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modern QR Code Print Template (Hidden) - A5 Size (Half A4) */}
      <div className="hidden">
        <div ref={printRef} className="w-[148mm] h-[210mm] bg-white relative flex flex-col p-12 font-sans overflow-hidden text-zinc-900">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -mr-16 -mt-16 border border-zinc-100" />
          
          {/* Header Section */}
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

          {/* Main Content */}
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

            {/* QR Code Container with "Hardware" feel */}
            <div className="relative">
              {/* Corner Accents */}
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

          {/* Footer Section */}
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

          {/* Bottom Accent Bar */}
          <div className="absolute bottom-0 left-0 w-full h-2 flex">
            <div className="flex-1 bg-zinc-100" />
            <div className="flex-1 bg-blue-600" />
            <div className="flex-1 bg-zinc-900" />
          </div>
        </div>
      </div>
      {/* Bulk Print Template (4 per page) */}
      <div className="hidden">
        <div ref={bulkPrintRef} className="w-[210mm] bg-white text-zinc-900 font-sans">
          {selectedClient?.locations && Array.from({ length: Math.ceil(selectedClient.locations.length / 4) }).map((_, pageIndex) => (
            <div key={pageIndex} className="w-[210mm] h-[297mm] grid grid-cols-2 grid-rows-2 p-[10mm] gap-[10mm] page-break-after-always">
              {selectedClient.locations?.slice(pageIndex * 4, (pageIndex * 4) + 4).map((loc) => (
                <div key={loc.id} className="border border-zinc-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white shadow-sm">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-50 rounded-bl-full -mr-8 -mt-8 border border-zinc-100" />
                  
                  {/* Header */}
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

                  {/* QR Code */}
                  <div className="bg-white p-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-50 relative z-10">
                    <QRCodeCanvas 
                      value={getPublicUrl(selectedClientId, loc.id)}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Footer */}
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

                  {/* Bottom Accent */}
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
