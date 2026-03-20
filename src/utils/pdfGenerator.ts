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
    await new Promise(resolve => setTimeout(resolve, 1000));

    const opt: any = {
      margin: 0, // Margens controladas pelo CSS do elemento
      filename: fileName,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 3, // Aumentado para maior nitidez
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false
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
        avoid: ['.break-inside-avoid', 'tr', '.no-break']
      }
    };

    // Usando html2pdf para gerar o PDF respeitando quebras de página
    await html2pdf().set(opt).from(element).save();
    
    console.log('PDF gerado com sucesso via html2pdf.js');
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
