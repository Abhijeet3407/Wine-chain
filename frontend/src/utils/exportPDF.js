import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function exportToPDF(bottles) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(28, 26, 46);
  doc.text("Wine Chain — Inventory Report", 14, 18);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${new Date().toLocaleString("en-GB")}`, 14, 26);
  doc.text(
    `Total bottles: ${bottles.reduce((a, b) => a + b.quantity, 0)}`,
    14,
    32,
  );
  doc.text(`Total wines: ${bottles.length}`, 80, 32);
  doc.text(
    `Portfolio value: £${bottles
      .reduce((a, b) => a + b.purchasePrice * b.quantity, 0)
      .toLocaleString("en-GB", { maximumFractionDigits: 0 })}`,
    140,
    32,
  );

  // Table
  autoTable(doc, {
    startY: 40,
    head: [
      ["ID", "Wine", "Vintage", "Type", "Region", "Qty", "Owner", "Status"],
    ],
    body: bottles.map((b) => [
      b.bottleId,
      `${b.name}\n${b.producer}`,
      b.vintage,
      b.type,
      b.region,
      b.quantity,
      b.currentOwner,
      b.status,
    ]),
    headStyles: {
      fillColor: [28, 26, 46],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [245, 244, 240] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 40 },
      2: { cellWidth: 16 },
      3: { cellWidth: 18 },
      4: { cellWidth: 30 },
      5: { cellWidth: 10 },
      6: { cellWidth: 28 },
      7: { cellWidth: 18 },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `Wine Chain Blockchain Inventory — Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  doc.save(`wine-chain-inventory-${new Date().toISOString().slice(0, 10)}.pdf`);
}
