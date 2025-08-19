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

	// Front side
	await drawFrontSide(pdf, dims, { categoryLabel, memberName, membershipNumber, branch, section });

	// Back side
	pdf.addPage([86, 54], 'landscape');
	drawBackSide(pdf, dims);

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

	// Details (single column: NAME, MEMBERSHIP NUMBER, BRANCH, SECTION)
	const labelYStart = 30;
	const lineGap = 4.8; // compact to fit 4 rows comfortably
	const labelX = 5;
	const valueX = 35;

	const drawRow = (label, value, row) => {
		const y = labelYStart + lineGap * row;
		const normalized = value && String(value).trim() ? String(value) : 'N/A';
		pdf.setTextColor(...accentBlue);
		pdf.setFont('helvetica', 'bold');
		pdf.setFontSize(5.5);
		pdf.text(`${label}:`, labelX, y);
		pdf.setTextColor(20, 20, 20);
		pdf.setFont('helvetica', 'normal');
		pdf.setFontSize(6);
		pdf.text(normalized, valueX, y);
	};

	drawRow('NAME', memberName, 0);
	drawRow('MEMBERSHIP NUMBER', membershipNumber, 1);
	drawRow('BRANCH', branch, 2);
	drawRow('SECTION', section, 3);

	// Signature
	pdf.setTextColor(...accentBlue);
	pdf.setFont('helvetica', 'bold');
	pdf.setFontSize(6);
	const signatureTextY = h - 6; // keep label comfortably above the bottom but visible
	pdf.text('SIGNATURE', 5, signatureTextY);
	pdf.setDrawColor(170, 170, 170);
	pdf.setLineWidth(0.4);
	const signatureLineY = h - 4; // place the signing line near the bottom border
	pdf.line(30, signatureLineY, w - 8, signatureLineY);
	// Intentionally avoid adding a watermark logo near the signature area to prevent any overlap
}


function drawBackSide(pdf, dims) {
	const { w, h } = dims;
	const borderColor = [233, 30, 99]; // pink
	const headerBlue = [33, 76, 140]; // deep blue similar to front
	const textBlue = [30, 64, 175];

	// Border
	pdf.setDrawColor(...borderColor);
	pdf.setLineWidth(0.6);
	pdf.roundedRect(2, 2, w - 4, h - 4, 3, 3);

	const startX = 6;
	let y = 9;

	const writeLabelValue = (label, value) => {
		pdf.setFont('helvetica', 'bold');
		pdf.setTextColor(...textBlue);
		pdf.setFontSize(6.5);
		pdf.text(label, startX, y);
		pdf.setFont('helvetica', 'normal');
		pdf.setTextColor(25, 25, 25);
		pdf.setFontSize(6.5);
		pdf.text(`: ${value}`, startX + 26, y);
		y += 5.2;
	};

	const writeEmail = email => {
		pdf.setFont('helvetica', 'normal');
		pdf.setTextColor(25, 25, 25);
		pdf.setFontSize(6);
		pdf.text(`Email: ${email}`, startX, y);
		y += 5.2;
	};

	// Heading row spacing slightly larger at the top
	pdf.setFont('helvetica', 'bold');
	pdf.setTextColor(...headerBlue);
	pdf.setFontSize(8);
	pdf.text('Contact', startX, y - 2.5);

	// Offices
	writeLabelValue('Head Office', '01 664 0600');
	writeEmail('inmo@inmo.ie');

	writeLabelValue('Cork', '021 470 3000');
	writeEmail('inmocork@inmo.ie');

	writeLabelValue('Limerick', '061 308999');
	writeEmail('inmolimerick@inmo.ie');

	writeLabelValue('Galway', '091 581818');
	writeEmail('inmogalway@inmo.ie');

	// Websites (centered)
	const sitesY = h - 14.5;
	pdf.setFont('helvetica', 'normal');
	pdf.setTextColor(...headerBlue);
	pdf.setFontSize(6);
	pdf.text('www.inmo.ie    www.nurse2nurse.ie', w / 2, sitesY, { align: 'center' });
	pdf.text('www.inmoprofessional.ie', w / 2, sitesY + 4.5, { align: 'center' });

	// Simple social placeholders (three small squares) bottom-left
	const iconY = h - 8;
	let iconX = 10;
	pdf.setFillColor(...headerBlue);
	for (let i = 0; i < 3; i += 1) {
		pdf.rect(iconX, iconY, 3.5, 3.5, 'F');
		iconX += 6;
	}
}

