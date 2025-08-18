import jsPDF from 'jspdf';

/**
 * Generate a simple Rule Book PDF tailored to a membership category.
 */
export function generateRuleBookPDF({ categoryLabel, fileName = 'rule-book.pdf' }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setFontSize(20);
  pdf.text('Membership Rule Book', 40, 60);
  pdf.setFontSize(12);
  if (categoryLabel) {
    pdf.text(`Category: ${categoryLabel}`, 40, 90);
  }
  const body = [
    'This is a placeholder Rule Book tailored to your membership category.',
    'Replace this content with the organization\'s official rule book text or',
    'embed a pre-generated PDF file in production.',
  ].join(' ');
  pdf.text(body, 40, 120, { maxWidth: 520 });
  pdf.save(fileName);
}


