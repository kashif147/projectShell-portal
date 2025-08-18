import jsPDF from 'jspdf';
import logo from '../../assets/images/logo.png';

/**
 * Generate a single-sided Membership Card PDF (credit-card size 86mm x 54mm)
 * with a clean, attractive layout.
 */
export async function generateMembershipCardPDF({
	categoryLabel,
	memberName,
	membershipNumber,
	branch,
	section,
	fileName = 'membership-card.pdf',
}) {
	const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] });
	const dims = { w: 86, h: 54 };
	await drawFrontSide(pdf, dims, { categoryLabel, memberName, membershipNumber, branch, section });
	pdf.save(fileName);
}

async function drawFrontSide(pdf, dims, data) {
	const { w, h } = dims; // mm
	const { categoryLabel, memberName, membershipNumber, branch, section } = data;
	const borderColor = [233, 30, 99]; // pink
	const headerBlue = [30, 64, 175];
	const accentBlue = [37, 99, 235];

	// Border
	pdf.setDrawColor(...borderColor);
	pdf.setLineWidth(0.6);
	pdf.roundedRect(2, 2, w - 4, h - 4, 3, 3);

	// Logo
	try {
		const img = new Image();
		img.src = logo;
		await new Promise(res => { img.onload = res; img.onerror = res; });
		pdf.addImage(img, 'PNG', w / 2 - 10, 4, 20, 10);
	} catch {}

	// Title
	pdf.setTextColor(...headerBlue);
	pdf.setFont('helvetica', 'bold');
	pdf.setFontSize(6);
	pdf.text(categoryLabel || 'Membership', w / 2, 15.5, { align: 'center' });
	pdf.setTextColor(120, 120, 120);
	pdf.setFontSize(5);

	// Header strip
	pdf.setFillColor(...headerBlue);
	pdf.rect(3, 20.5, w - 6, 6, 'F');
	pdf.setTextColor(255, 255, 255);
	pdf.setFont('helvetica', 'bold');
	pdf.setFontSize(7.5);
	pdf.text('MEMBERSHIP CARD', w / 2, 24, { align: 'center' });

	// Details
	const labelYStart = 31;
	const lineGap = 6.0; // generous spacing between rows
	const labelX = 5;
	const valueX = 35; // values pushed right for clear separation

	const drawRow = (label, value, row) => {
		const y = labelYStart + lineGap * row;
		pdf.setTextColor(...accentBlue);
		pdf.setFont('helvetica', 'bold');
		pdf.setFontSize(5.5);
		pdf.text(`${label}:`, labelX, y);
		pdf.setTextColor(20, 20, 20);
		pdf.setFont('helvetica', 'normal');
		pdf.setFontSize(6);
		pdf.text((value ?? 'N/A').toString(), valueX, y);
	};

	drawRow('NAME', memberName, 0);
	drawRow('MEMBERSHIP NUMBER', membershipNumber, 1);
	drawRow('BRANCH', branch, 2);
	drawRow('SECTION', section, 3);

	// Signature
	pdf.setTextColor(...accentBlue);
	pdf.setFont('helvetica', 'bold');
	pdf.setFontSize(6);
	pdf.text('SIGNATURE', 5, h - 6);
	pdf.setDrawColor(170, 170, 170);
	pdf.setLineWidth(0.4);
	pdf.line(30, h - 6.5, w - 8, h - 6.5);
	try {
		const img = new Image();
		img.src = logo;
		await new Promise(res => { img.onload = res; img.onerror = res; });
		pdf.addImage(img, 'PNG', w / 2 - 7, h - 11.5, 14, 7);
	} catch {}
}


