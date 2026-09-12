import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PARAM_NAMES = [
  'P1: Coverage of syllabus',
  'P2: Covering relevant topics beyond syllabus',
  'P3: Effectiveness in terms of technical contents',
  'P4: Effectiveness in terms of communication skills',
  'P5: Effectiveness in terms of Teaching aids',
  'P6: Motivation and inspiration for self-learning',
  'P7: Practical Skills & Performance',
  'P8: Project & Seminar guidance',
  'P9: Feedback on student progress',
  'P10: Punctuality and discipline',
  'P11: Domain Knowledge',
  'P12: Interaction with students',
  'P13: Ability to resolve difficulties',
  'P14: Encourage co-curricular activities',
  'P15: Encourage extra-curricular activities',
  'P16: Guidance during Internship',
];

export async function exportReportPDF(report) {
  if (!report || !report.session) throw new Error('No report data available');

  const { session, faculty_reports = [], submitted = [], pending = [], roster_count = 0 } = report;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Try to load logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo.png';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
      setTimeout(resolve, 800);
    });
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      doc.addImage(logoImg, 'PNG', 14, 10, 18, 18);
    }
  } catch (e) {
    // Continue without logo if unavailable
  }

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(20, 35, 90); // Navy blue
  doc.text('GOVERNMENT POLYTECHNIC AWASARI (KHURD)', 36, 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 60, 80);
  const deptTitle = session.dept_name
    ? (session.dept_name.toLowerCase().startsWith('department of') ? session.dept_name : `Department of ${session.dept_name}`)
    : 'All Departments';
  doc.text(deptTitle.toUpperCase(), 36, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text('STUDENT FEEDBACK ON FACULTY PERFORMANCE · MSBTE CIAAN-2023 K15 SCHEME', 36, 27);

  // Metadata Box
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, 32, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const participationPct = roster_count > 0 ? Math.round((submitted.length / roster_count) * 100) : 0;

  doc.text(`Academic Year: ${session.year_label || '2025-26'}`, 18, 38);
  doc.text(`Semester: Semester ${session.semester || '—'}`, 80, 38);
  doc.text(`Session: ${session.title || 'General Feedback'}`, 140, 38);
  doc.text(`Report Date: ${today}`, 235, 38);

  doc.text(`Enrolled Students: ${roster_count}`, 18, 43);
  doc.text(`Submissions Received: ${submitted.length}`, 80, 43);
  doc.text(`Pending Students: ${pending.length}`, 140, 43);
  doc.text(`Participation Rate: ${participationPct}%`, 235, 43);

  // Table 1: Faculty Scores
  const head = [
    [
      '#', 'Faculty Name', 'Subject (Code)', 'Type', 'Batch',
      'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8',
      'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16',
      'Total /80', 'Marks /25', 'Evals'
    ]
  ];

  const body = faculty_reports.map((f, i) => [
    i + 1,
    f.faculty_name || '—',
    `${f.subject_name || '—'}\n(${f.subject_code || ''})`,
    f.allocation_type || 'BOTH',
    f.batch && f.batch !== 'ALL' ? f.batch : 'ALL',
    f.p1 ? parseFloat(f.p1).toFixed(1) : '—',
    f.p2 ? parseFloat(f.p2).toFixed(1) : '—',
    f.p3 ? parseFloat(f.p3).toFixed(1) : '—',
    f.p4 ? parseFloat(f.p4).toFixed(1) : '—',
    f.p5 ? parseFloat(f.p5).toFixed(1) : '—',
    f.p6 ? parseFloat(f.p6).toFixed(1) : '—',
    f.p7 ? parseFloat(f.p7).toFixed(1) : '—',
    f.p8 ? parseFloat(f.p8).toFixed(1) : '—',
    f.p9 ? parseFloat(f.p9).toFixed(1) : '—',
    f.p10 ? parseFloat(f.p10).toFixed(1) : '—',
    f.p11 ? parseFloat(f.p11).toFixed(1) : '—',
    f.p12 ? parseFloat(f.p12).toFixed(1) : '—',
    f.p13 ? parseFloat(f.p13).toFixed(1) : '—',
    f.p14 ? parseFloat(f.p14).toFixed(1) : '—',
    f.p15 ? parseFloat(f.p15).toFixed(1) : '—',
    f.p16 ? parseFloat(f.p16).toFixed(1) : '—',
    f.avg_raw ? parseFloat(f.avg_raw).toFixed(1) : '—',
    f.avg_marks ? parseFloat(f.avg_marks).toFixed(2) : '—',
    f.evaluation_count || 0
  ]);

  autoTable(doc, {
    startY: 50,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 58, 138], // Navy #1e3a8a
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 34 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 12 },
      // Parameters P1..P16
      5: { halign: 'center', cellWidth: 8 },
      6: { halign: 'center', cellWidth: 8 },
      7: { halign: 'center', cellWidth: 8 },
      8: { halign: 'center', cellWidth: 8 },
      9: { halign: 'center', cellWidth: 8 },
      10: { halign: 'center', cellWidth: 8 },
      11: { halign: 'center', cellWidth: 8 },
      12: { halign: 'center', cellWidth: 8 },
      13: { halign: 'center', cellWidth: 8 },
      14: { halign: 'center', cellWidth: 8 },
      15: { halign: 'center', cellWidth: 8 },
      16: { halign: 'center', cellWidth: 8 },
      17: { halign: 'center', cellWidth: 8 },
      18: { halign: 'center', cellWidth: 8 },
      19: { halign: 'center', cellWidth: 8 },
      20: { halign: 'center', cellWidth: 8 },
      // Summary
      21: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      22: { halign: 'center', fontStyle: 'bold', textColor: [15, 118, 110], cellWidth: 15 },
      23: { halign: 'center', cellWidth: 10 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Table 2: Parameter Legend Key
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 150;
  if (finalY > pageHeight - 45) {
    doc.addPage();
    finalY = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('MSBTE CIAAN-2023 K15 PARAMETERS REFERENCE KEY (SCALE 1 = VERY POOR, 5 = EXCELLENT):', 14, finalY);

  const legendHead = [['Code', 'Parameter Description', 'Code', 'Parameter Description']];
  const legendBody = [];
  for (let i = 0; i < 8; i++) {
    legendBody.push([
      `P${i + 1}`,
      PARAM_NAMES[i].replace(/^P\d+:\s*/, ''),
      `P${i + 9}`,
      PARAM_NAMES[i + 8] ? PARAM_NAMES[i + 8].replace(/^P\d+:\s*/, '') : ''
    ]);
  }

  autoTable(doc, {
    startY: finalY + 2,
    head: legendHead,
    body: legendBody,
    theme: 'plain',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      textColor: [100, 116, 139],
    },
    headStyles: {
      fontStyle: 'bold',
      textColor: [51, 65, 85],
      fillColor: [241, 245, 249],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 10 },
      1: { cellWidth: 120 },
      2: { fontStyle: 'bold', cellWidth: 10 },
      3: { cellWidth: 120 },
    },
  });

  // Signatures at bottom
  let sigY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : pageHeight - 20;
  if (sigY > pageHeight - 25) {
    doc.addPage();
    sigY = pageHeight - 25;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const colWidth = (pageWidth - 28) / 4;
  doc.line(14, sigY, 14 + colWidth - 8, sigY);
  doc.text('Class Teacher', 14 + (colWidth - 8) / 2, sigY + 4, { align: 'center' });

  doc.line(14 + colWidth, sigY, 14 + colWidth * 2 - 8, sigY);
  doc.text('Academic Coordinator', 14 + colWidth + (colWidth - 8) / 2, sigY + 4, { align: 'center' });

  doc.line(14 + colWidth * 2, sigY, 14 + colWidth * 3 - 8, sigY);
  doc.text('Head of Department', 14 + colWidth * 2 + (colWidth - 8) / 2, sigY + 4, { align: 'center' });

  doc.line(14 + colWidth * 3, sigY, pageWidth - 14, sigY);
  doc.text('Principal', 14 + colWidth * 3 + (colWidth - 8) / 2, sigY + 4, { align: 'center' });

  // Page Numbers Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Government Polytechnic Awasari (Kh) · MSBTE Evaluation Portal · Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const safeTitle = (session.title || 'Session').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Feedback_Report_${session.dept_code || 'GPA'}_Sem${session.semester || ''}_${safeTitle}.pdf`;
  doc.save(filename);
}
