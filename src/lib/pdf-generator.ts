import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function generateQrPdfBuffer(
  code: string,
  url: string,
  clinicName?: string | null,
  doctorName?: string | null,
  logoUrl?: string | null
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // High-res A5 landscape with 300 DPI vector scale: 595.28 x 419.53 points
      const doc = new PDFDocument({ size: [595.28, 419.53], margin: 25 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Generate ultra high-res QR code PNG buffer (300 DPI 1200px)
      const qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 1200,
        margin: 1,
        color: { dark: '#0f766e', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });

      // Background card shape
      doc.rect(0, 0, 595.28, 419.53).fill('#ffffff');
      
      // Professional Printer Crop Marks (+) at corners
      doc.lineWidth(0.5).strokeColor('#cbd5e1');
      // Top-Left crop mark
      doc.moveTo(5, 15).lineTo(20, 15).stroke();
      doc.moveTo(15, 5).lineTo(15, 20).stroke();
      // Top-Right crop mark
      doc.moveTo(575, 15).lineTo(590, 15).stroke();
      doc.moveTo(580, 5).lineTo(580, 20).stroke();
      // Bottom-Left crop mark
      doc.moveTo(5, 404).lineTo(20, 404).stroke();
      doc.moveTo(15, 399).lineTo(15, 414).stroke();
      // Bottom-Right crop mark
      doc.moveTo(575, 404).lineTo(590, 404).stroke();
      doc.moveTo(580, 399).lineTo(580, 414).stroke();

      // Main Outer Border & Accent Bar
      doc.rect(20, 20, 555.28, 379.53).lineWidth(2).stroke('#0f766e');
      doc.rect(20, 20, 555.28, 10).fill('#0f766e');

      // Brand Title & Tagline
      doc.fill('#0f766e').fontSize(24).font('Helvetica-Bold').text('Doctor Diary', 45, 45);
      doc.fontSize(10).font('Helvetica').fill('#0d9488').text('by NatureXpress • Skip the Waiting Queue', 45, 73);

      // Clinic / Doctor Name Header Block
      if (doctorName || clinicName) {
        doc.rect(45, 95, 270, 50).fill('#f0fdfa');
        doc.rect(45, 95, 270, 50).lineWidth(1).stroke('#ccfbf1');
        doc.fill('#0f172a').fontSize(13).font('Helvetica-Bold').text(doctorName || clinicName || '', 55, 104, { width: 250 });
        if (clinicName && doctorName) {
          doc.fill('#0f766e').fontSize(10).font('Helvetica').text(clinicName, 55, 122, { width: 250 });
        }
      }

      // Live Queue Feature Steps
      doc.fill('#0f172a').fontSize(13).font('Helvetica-Bold').text('How to Track Live Token:', 45, 160);
      
      doc.fill('#334155').fontSize(10.5).font('Helvetica')
        .text('1. Open phone camera or tap NFC phone', 45, 182)
        .text('2. Scan QR code / View live token position', 45, 204)
        .text('3. Arrive on time — zero waiting room hassle!', 45, 226);

      // Code Pill
      doc.rect(45, 268, 150, 32).fill('#0f766e');
      doc.fill('#ffffff').fontSize(13).font('Helvetica-Bold').text(`Code: ${code}`, 45, 277, { width: 150, align: 'center' });

      // NFC Dual Callout Badge
      doc.rect(45, 312, 270, 24).fill('#e0f2fe');
      doc.fill('#0369a1').fontSize(9.5).font('Helvetica-Bold').text('📶 TAP PHONE HERE OR SCAN QR BELOW', 45, 319, { width: 270, align: 'center' });

      // Powered by Razorpay-style Footer
      doc.fill('#64748b').fontSize(9.5).font('Helvetica').text('⚡ Powered by Doctor Diary   •   Free Patient Queue Infrastructure', 45, 360);

      // Right Column: QR Hero Card
      doc.rect(340, 48, 220, 310).fill('#f8fafc');
      doc.rect(340, 48, 220, 310).lineWidth(1.5).stroke('#cbd5e1');

      doc.fill('#0f766e').fontSize(12).font('Helvetica-Bold').text('SCAN OR TAP TO TRACK', 340, 65, { width: 220, align: 'center' });
      doc.image(qrBuffer, 355, 88, { width: 190 });
      
      // Phone Camera Hint Box below QR
      doc.rect(355, 290, 190, 28).fill('#0f766e');
      doc.fill('#ffffff').fontSize(10).font('Helvetica-Bold').text('ANY CAMERA / NFC PHONE', 355, 299, { width: 190, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateSalesPackPdfBuffer(
  code: string,
  baseUrl: string,
  clinicName?: string | null,
  doctorName?: string | null
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create multi-page A4 PDF (595.28 x 841.89 pt)
      const doc = new PDFDocument({ size: 'A4', margin: 20, autoFirstPage: false });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const redirectUrl = `${baseUrl}/q/${code}`;
      const qrBuffer = await QRCode.toBuffer(`${redirectUrl}?src=reception`, {
        type: 'png',
        width: 800,
        margin: 1,
        color: { dark: '#0f766e', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });

      // ─── PAGE 1: RECEPTION DESK POSTER (A4) ───
      doc.addPage();
      doc.rect(0, 0, 595.28, 841.89).fill('#042f2e'); // Deep Emerald

      // Top Header
      doc.fill('#2dd4bf').fontSize(28).font('Helvetica-Bold').text('Doctor Diary', 40, 40);
      doc.fill('#99f6e4').fontSize(12).font('Helvetica').text('Skip the Waiting Queue • Live Token Tracker', 40, 75);

      if (doctorName || clinicName) {
        doc.rect(40, 100, 515.28, 60).fill('#064e3b');
        doc.fill('#ffffff').fontSize(18).font('Helvetica-Bold').text(doctorName || clinicName || '', 55, 112);
        if (clinicName) doc.fill('#a7f3d0').fontSize(12).text(clinicName, 55, 136);
      }

      doc.fill('#ffffff').fontSize(24).font('Helvetica-Bold').text('LIVE QUEUE TRACKER', 40, 185);
      doc.fill('#facc15').fontSize(14).font('Helvetica-Bold').text('See your token position in real-time', 40, 215);

      // Steps
      doc.fill('#e2e8f0').fontSize(13).font('Helvetica')
        .text('1. Scan QR with phone camera', 40, 260)
        .text('2. View live token number & position', 40, 295)
        .text('3. Know your exact turn time', 40, 330)
        .text('4. Arrive on time — zero queue!', 40, 365);

      // QR Image Hero Card
      doc.rect(170, 420, 255, 275).fill('#ffffff');
      doc.image(qrBuffer, 195, 435, { width: 205 });
      doc.fill('#0f766e').fontSize(11).font('Helvetica-Bold').text('ANY CAMERA / NFC PHONE', 170, 660, { width: 255, align: 'center' });

      // Footer Badge
      doc.rect(40, 750, 515.28, 40).fill('#0f766e');
      doc.fill('#ffffff').fontSize(13).font('Helvetica-Bold').text(`⚡ Powered by Doctor Diary   •   Code: #${code}`, 40, 764, { width: 515.28, align: 'center' });

      // ─── PAGE 2: OUTSIDE WINDOW POSTER (A4) ───
      doc.addPage();
      doc.rect(0, 0, 595.28, 841.89).fill('#0f172a'); // Midnight Slate

      doc.fill('#818cf8').fontSize(28).font('Helvetica-Bold').text('Doctor Diary', 40, 40);
      doc.fill('#c7d2fe').fontSize(12).font('Helvetica').text('Clinic Closed or Doctor Out? Book Online Instantly', 40, 75);

      if (doctorName || clinicName) {
        doc.rect(40, 100, 515.28, 60).fill('#1e1b4b');
        doc.fill('#ffffff').fontSize(18).font('Helvetica-Bold').text(doctorName || clinicName || '', 55, 112);
        if (clinicName) doc.fill('#c7d2fe').fontSize(12).text(clinicName, 55, 136);
      }

      doc.fill('#ffffff').fontSize(24).font('Helvetica-Bold').text('CLINIC CLOSED OR DOCTOR OUT?', 40, 185);
      doc.fill('#38bdf8').fontSize(14).font('Helvetica-Bold').text('Book next open time slot in 30 seconds', 40, 215);

      doc.fill('#e2e8f0').fontSize(13).font('Helvetica')
        .text('1. Scan QR with phone camera', 40, 260)
        .text('2. Pick date & time slot', 40, 295)
        .text('3. Instant confirmation token', 40, 330)
        .text('4. Come on your day — zero wait!', 40, 365);

      doc.rect(170, 420, 255, 275).fill('#ffffff');
      doc.image(qrBuffer, 195, 435, { width: 205 });
      doc.fill('#312e81').fontSize(11).font('Helvetica-Bold').text('SCAN TO BOOK NEXT VISIT', 170, 660, { width: 255, align: 'center' });

      doc.rect(40, 750, 515.28, 40).fill('#312e81');
      doc.fill('#ffffff').fontSize(13).font('Helvetica-Bold').text(`⚡ Powered by Doctor Diary   •   Code: #${code}`, 40, 764, { width: 515.28, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
