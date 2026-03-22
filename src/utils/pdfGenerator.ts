import html2pdf from 'html2pdf.js';

export async function generatePdf(element: HTMLElement, fileName: string, format: string = 'a4') {
  if (!element) {
    throw new Error('Elemento para geração do PDF não foi fornecido.');
  }
  
  try {
    console.log(`Iniciando geração de PDF (Motor: html2pdf.js, Formato: ${format}) para:`, fileName);
    
    // Garantir que as imagens estão carregadas
    const images = Array.from(element.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Pequeno delay para estabilização e renderização completa
    await new Promise(resolve => setTimeout(resolve, 1500));

    const opt: any = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, // Reduzido de 3 para 2 para economizar memória em dispositivos móveis
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false, // Alterado para false para evitar problemas de segurança de canvas
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200 // Força uma largura de janela para garantir layout consistente
      },
      jsPDF: { 
        unit: 'mm', 
        format: format, 
        orientation: 'portrait',
        compress: true,
        precision: 16
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['.break-inside-avoid', 'tr', '.no-break', 'img', 'table']
      }
    };

    // Usando html2pdf para gerar o PDF respeitando quebras de página
    // Geramos como Blob para ter mais controle sobre o download e evitar extensão .bin
    const worker = html2pdf().set(opt).from(element);
    const pdfBlob = await worker.output('blob');
    
    // Garantir que o Blob tenha o tipo MIME correto
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    
    // Criar URL para o Blob
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link temporário para forçar o download com o nome correto
    const link = document.createElement('a');
    link.href = url;
    
    // Garantir que o nome do arquivo seja seguro e termine com .pdf
    const sanitizedFileName = fileName
      .replace(/[/\\?%*:|"<>]/g, '-') // Remover caracteres inválidos para nomes de arquivo
      .trim();
    
    const finalFileName = sanitizedFileName.toLowerCase().endsWith('.pdf') 
      ? sanitizedFileName 
      : `${sanitizedFileName}.pdf`;
    
    link.download = finalFileName;
    
    // Adicionar ao corpo, clicar e remover
    document.body.appendChild(link);
    link.click();
    
    // Pequeno delay antes de limpar para garantir que o download iniciou
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
    
    console.log(`PDF gerado e download iniciado manualmente: ${finalFileName}`);
    return true;
  } catch (error) {
    console.error('Erro crítico na geração do PDF:', error);
    let message = 'Erro desconhecido';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    throw new Error(`Falha na geração do PDF: ${message}`);
  }
}
