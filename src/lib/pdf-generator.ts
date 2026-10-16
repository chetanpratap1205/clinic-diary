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

export interface ClinicalRxData {
  clinicName: string;
  doctorName: string;
  specialty: string;
  degree?: string | null;
  phone?: string | null;
  address?: string | null;
  partnerLabName?: string | null;
  preferredHospital?: string | null;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  abhaId?: string | null;
  tokenNumber?: number | null;
  appointmentDate: string;
  vitals?: string | null;
  diagnosis?: string | null;
  complaint?: string | null;
  treatment?: string | null;
  labInvestigations?: string[] | null;
  referral?: {
    referredHospital?: string;
    specialty?: string;
    priority?: string;
    reason?: string;
  } | null;
  receiptUrl?: string;
}

export async function generateClinicalRxPdfBuffer(data: ClinicalRxData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 35 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Top Header Accent Line
      doc.rect(35, 30, 525, 4).fill('#0f766e');

      // Clinic & Doctor Details
      doc.fill('#0f766e').fontSize(20).font('Helvetica-Bold').text(data.clinicName, 35, 45);
      doc.fill('#1e293b').fontSize(12).font('Helvetica-Bold')
        .text(`${data.doctorName}${data.degree ? ` (${data.degree})` : ''} • ${data.specialty}`, 35, 70);
      
      const subInfo = [data.address, data.phone ? `Ph: ${data.phone}` : null].filter(Boolean).join(' | ');
      if (subInfo) {
        doc.fill('#64748b').fontSize(9).font('Helvetica').text(subInfo, 35, 86, { width: 400 });
      }

      // Doctor Diary Badge (Top Right)
      doc.fill('#0d9488').fontSize(10).font('Helvetica-Bold').text('DOCTOR DIARY', 440, 48, { width: 120, align: 'right' });
      doc.fill('#94a3b8').fontSize(8).font('Helvetica').text('Clinical Health Record', 440, 62, { width: 120, align: 'right' });

      // Horizontal separator
      doc.moveTo(35, 105).lineTo(560, 105).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // Patient Info Card
      doc.rect(35, 115, 525, 50).fill('#f8fafc');
      doc.rect(35, 115, 525, 50).lineWidth(1).strokeColor('#e2e8f0').stroke();

      doc.fill('#64748b').fontSize(8).font('Helvetica-Bold').text('PATIENT NAME', 45, 123);
      doc.fill('#0f172a').fontSize(11).font('Helvetica-Bold').text(data.patientName, 45, 134);
      if (data.abhaId) {
        doc.fill('#059669').fontSize(8).font('Helvetica-Bold').text(`ABHA ID: ${data.abhaId} (Verified)`, 45, 150);
      }

      doc.fill('#64748b').fontSize(8).font('Helvetica-Bold').text('AGE / GENDER', 230, 123);
      doc.fill('#0f172a').fontSize(10).font('Helvetica')
        .text(`${data.patientAge ? `${data.patientAge} Yrs` : 'N/A'} / ${data.patientGender || 'N/A'}`, 230, 135);

      doc.fill('#64748b').fontSize(8).font('Helvetica-Bold').text('DATE & TOKEN', 380, 123);
      doc.fill('#0f172a').fontSize(10).font('Helvetica-Bold')
        .text(`${data.appointmentDate} • Token #${data.tokenNumber || 'Walk-in'}`, 380, 135);

      let currentY = 180;

      // Vitals Box
      if (data.vitals) {
        doc.rect(35, currentY, 525, 26).fill('#ecfdf5');
        doc.fill('#047857').fontSize(8.5).font('Helvetica-Bold').text('CLINICAL VITALS:', 45, currentY + 8);
        doc.fill('#064e3b').fontSize(8.5).font('Helvetica').text(data.vitals, 140, currentY + 8, { width: 410 });
        currentY += 36;
      }

      // Complaint & Diagnosis
      if (data.complaint || data.diagnosis) {
        if (data.complaint) {
          doc.fill('#475569').fontSize(8.5).font('Helvetica-Bold').text('Chief Symptoms:', 35, currentY);
          doc.fill('#1e293b').fontSize(9.5).font('Helvetica').text(data.complaint, 120, currentY, { width: 440 });
          currentY += 18;
        }
        if (data.diagnosis) {
          doc.fill('#475569').fontSize(8.5).font('Helvetica-Bold').text('Diagnosis:', 35, currentY);
          doc.fill('#0f172a').fontSize(10).font('Helvetica-Bold').text(data.diagnosis, 120, currentY, { width: 440 });
          currentY += 22;
        }
      }

      // Prescription / Treatment Section
      doc.rect(35, currentY, 525, 22).fill('#f1f5f9');
      doc.fill('#0f172a').fontSize(9.5).font('Helvetica-Bold').text('Rx • TREATMENT & MEDICATION FORMULARY', 45, currentY + 6);
      currentY += 28;

      if (data.treatment) {
        doc.fill('#0f172a').fontSize(9.5).font('Courier').text(data.treatment, 45, currentY, { width: 505, lineGap: 3 });
        const treatmentLines = data.treatment.split('\n').length;
        currentY += Math.max(treatmentLines * 15, 60) + 15;
      } else {
        doc.fill('#94a3b8').fontSize(9).font('Helvetica').text('No prescription medication recorded.', 45, currentY);
        currentY += 30;
      }

      // Diagnostic Lab Investigations
      if (data.labInvestigations && data.labInvestigations.length > 0) {
        doc.rect(35, currentY, 525, 18 + data.labInvestigations.length * 14).fill('#eff6ff');
        doc.rect(35, currentY, 525, 18 + data.labInvestigations.length * 14).lineWidth(0.5).strokeColor('#bfdbfe').stroke();

        doc.fill('#1d4ed8').fontSize(8.5).font('Helvetica-Bold')
          .text(`ADVISED DIAGNOSTIC INVESTIGATIONS (${data.partnerLabName || 'Preferred Pathology'}):`, 45, currentY + 6);
        
        let testY = currentY + 20;
        data.labInvestigations.forEach((test) => {
          doc.fill('#1e3a8a').fontSize(8.5).font('Helvetica').text(`•  ${test}`, 55, testY);
          testY += 13;
        });
        currentY = testY + 12;
      }

      // Tertiary Hospital Referral Slip
      if (data.referral && data.referral.referredHospital) {
        const refHeight = 44;
        doc.rect(35, currentY, 525, refHeight).fill('#fffbeb');
        doc.rect(35, currentY, 525, refHeight).lineWidth(0.5).strokeColor('#fde68a').stroke();

        doc.fill('#b45309').fontSize(8.5).font('Helvetica-Bold')
          .text(`TERTIARY HOSPITAL REFERRAL (${(data.referral.priority || 'Priority').toUpperCase()}):`, 45, currentY + 6);
        doc.fill('#78350f').fontSize(9.5).font('Helvetica-Bold')
          .text(`Referred to: ${data.referral.referredHospital} — Department of ${data.referral.specialty || 'General'}`, 45, currentY + 18);
        if (data.referral.reason) {
          doc.fill('#92400e').fontSize(8).font('Helvetica').text(`Notes: ${data.referral.reason}`, 45, currentY + 31);
        }
        currentY += refHeight + 15;
      }

      // Footer: Doctor Signature & QR Verification
      const footerY = 740;
      doc.moveTo(35, footerY).lineTo(560, footerY).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

      doc.fill('#94a3b8').fontSize(8).font('Helvetica')
        .text('Generated electronically via Doctor Diary • Verified Clinical Record', 35, footerY + 10);
      
      // Signature line on right
      doc.moveTo(400, footerY + 35).lineTo(550, footerY + 35).lineWidth(1).strokeColor('#0f172a').stroke();
      doc.fill('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('Authorized Clinician Signature', 400, footerY + 40, { width: 150, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

