// Server-side PDF generation using jspdf
// Note: jspdf works in Node.js environment
import { jsPDF } from "jspdf";
import { SessionSolvedQuestion } from "@/@types";

interface SessionReportData {
    userName: string;
    sessionId: string;
    date: Date;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    solvedQuestions: SessionSolvedQuestion[];
}

export async function generateSessionPDF(data: SessionReportData): Promise<Buffer> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // ── Header band ──
    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("codeCraft", margin, 20);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Coding Challenges — Session Report", margin, 30);

    doc.setFontSize(9);
    doc.text(
        `Generated: ${data.date.toLocaleDateString("en-IN", { dateStyle: "long" })}`,
        margin,
        38
    );

    // ── Greeting ──
    y = 58;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text(`Hello, ${data.userName}!`, margin, y);

    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Session ID: ${data.sessionId}`, margin, y);

    // ── Divider ──
    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);

    // ── Stats boxes ──
    y += 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Session Summary", margin, y);

    y += 8;

    const boxes = [
        {
            label: "Total Solved",
            value: String(data.totalSolved),
            color: [249, 115, 22] as [number, number, number],
        },
        {
            label: "Easy",
            value: String(data.easySolved),
            color: [34, 197, 94] as [number, number, number],
        },
        {
            label: "Medium",
            value: String(data.mediumSolved),
            color: [251, 191, 36] as [number, number, number],
        },
        {
            label: "Hard",
            value: String(data.hardSolved),
            color: [239, 68, 68] as [number, number, number],
        },
    ];

    const boxW = (contentWidth - 9) / 4;
    boxes.forEach((box, i) => {
        const bx = margin + i * (boxW + 3);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(bx, y, boxW, 22, 2, 2, "F");

        doc.setFillColor(...box.color);
        doc.roundedRect(bx, y, 3, 22, 1, 1, "F");

        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(box.value, bx + 8, y + 13);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(box.label, bx + 8, y + 19);
    });

    y += 32;

    // ── Questions solved table ──
    if (data.solvedQuestions.length > 0) {
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Problems Solved", margin, y);
        y += 8;

        // Table header
        doc.setFillColor(249, 115, 22);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("#", margin + 2, y + 5.5);
        doc.text("Title", margin + 10, y + 5.5);
        doc.text("Difficulty", margin + contentWidth * 0.65, y + 5.5);
        doc.text("Language", margin + contentWidth * 0.8, y + 5.5);
        y += 8;

        data.solvedQuestions.forEach((q, idx) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }

            doc.setFillColor(
                idx % 2 === 0 ? 252 : 246,
                idx % 2 === 0 ? 252 : 246,
                idx % 2 === 0 ? 252 : 246
            );
            doc.rect(margin, y, contentWidth, 8, "F");

            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(String(idx + 1), margin + 2, y + 5.5);

            const truncTitle = q.title.length > 40 ? q.title.slice(0, 38) + "…" : q.title;
            doc.text(truncTitle, margin + 10, y + 5.5);

            const diffColor: Record<string, [number, number, number]> = {
                Easy: [34, 197, 94],
                Medium: [251, 191, 36],
                Hard: [239, 68, 68],
            };
            const [dr, dg, db] = diffColor[q.difficulty] || [100, 100, 100];
            doc.setTextColor(dr, dg, db);
            doc.setFont("helvetica", "bold");
            doc.text(q.difficulty, margin + contentWidth * 0.65, y + 5.5);

            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "normal");
            doc.text(q.language, margin + contentWidth * 0.8, y + 5.5);

            y += 8;
        });
    }

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 285, pageWidth - margin, 285);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(`© ${new Date().getFullYear()} codeCraft — Keep Coding, Keep Growing`, margin, 290);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: "right" });
    }

    const arrayBuffer = doc.output("arraybuffer");
    return Buffer.from(arrayBuffer);
}
