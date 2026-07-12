import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function generateQrPdfBuffer(code: string, url: string, clinicName?: string | null): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a nice small landscape card size for the PDF
      // A6 landscape: 419.53 x 297.64 points
      const doc = new PDFDocument({ size: [419.53, 297.64], margin: 20 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Generate QR as PNG buffer
      const qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 200,
        margin: 1,
        color: { dark: '#0f766e', light: '#ffffff' }, // Teal-700 QR Code
        errorCorrectionLevel: 'H'
      });

      // Background color (pure white)
      doc.rect(0, 0, 419.53, 297.64).fill('#ffffff');

      // Add a subtle teal border
      doc.rect(10, 10, 399.53, 277.64).lineWidth(3).stroke('#99f6e4'); // teal-200

      // Left column: Text
      doc.fill('#0f766e'); // teal-700
      doc.fontSize(22).font('Helvetica-Bold').text('Doctor Diary', 30, 40);
      
      doc.fontSize(10).font('Helvetica').fill('#14b8a6').text('by NatureXpress', 30, 68); // teal-500

      if (clinicName) {
        doc.moveDown(1.5);
        doc.fill('#0b3f3b').fontSize(14).font('Helvetica-Bold').text(clinicName, 30, doc.y, { width: 150 });
      }

      doc.fill('#0f766e').fontSize(13).font('Helvetica').text('Scan to Book Appointment', 30, 180, { width: 150 });
      
      doc.fontSize(10).fill('#2dd4bf').text(`Code: ${code}`, 30, 260); // teal-400

      // Right column: QR Code
      doc.image(qrBuffer, 200, 48, { width: 180 });

      // Add a scan me badge below QR
      doc.fill('#0f766e').fontSize(11).font('Helvetica-Bold').text('SCAN ME', 200, 240, { width: 180, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
