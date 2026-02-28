import nodemailer from "nodemailer";
import type { SessionSolvedQuestion } from "@/app/api/session/end/route";

interface SessionReportData {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    solvedQuestions: SessionSolvedQuestion[];
    sessionId: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendWelcomeEmail(to: string, name: string) {
        const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:40px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:32px;font-weight:800;">codeCarft</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">AI-Powered Coding Challenges</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#f97316;margin-top:0;">Welcome, ${name}! 🚀</h2>
            <p style="color:#aaa;line-height:1.7;">
              You're now part of the codeCarft community. Start a session, solve AI-generated challenges,
              and get a performance report emailed to you when you're done!
            </p>
            <div style="margin:32px 0;">
              <h3 style="color:#fff;margin-bottom:16px;">Get started in 3 steps:</h3>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;margin-bottom:12px;">
                <p style="color:#f97316;font-weight:bold;margin:0 0 4px;">① Start a Session</p>
                <p style="color:#666;margin:0;font-size:14px;">Dashboard → Start Session → Choose difficulty</p>
              </div>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;margin-bottom:12px;">
                <p style="color:#f97316;font-weight:bold;margin:0 0 4px;">② Solve Challenges</p>
                <p style="color:#666;margin:0;font-size:14px;">Submit correct code → unlock next question</p>
              </div>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;">
                <p style="color:#f97316;font-weight:bold;margin:0 0 4px;">③ End Session</p>
                <p style="color:#666;margin:0;font-size:14px;">Get a PDF performance report in your inbox</p>
              </div>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="display:inline-block;background:#f97316;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
              Start Coding →
            </a>
          </div>
          <div style="border-top:1px solid #222;padding:20px 40px;text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">© 2024 codeCarft AI · All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await this.send({ to, subject: "Welcome to codeCarft AI 🚀", html });
    }

    async sendSessionReport(to: string, name: string, data: SessionReportData, pdfBuffer: Buffer) {
        const questionRows = data.solvedQuestions
            .map(
                (q, i) =>
                    `<tr style="background:${i % 2 === 0 ? "#0f0f0f" : "#111"}">
            <td style="padding:10px 16px;color:#aaa;font-size:13px;">${i + 1}</td>
            <td style="padding:10px 16px;color:#fff;font-size:13px;">${q.title}</td>
            <td style="padding:10px 16px;font-size:13px;color:${
                q.difficulty === "Easy"
                    ? "#22c55e"
                    : q.difficulty === "Hard"
                      ? "#ef4444"
                      : "#fbbf24"
            };font-weight:bold;">${q.difficulty}</td>
            <td style="padding:10px 16px;color:#aaa;font-size:13px;">${q.language}</td>
          </tr>`
            )
            .join("");

        const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
        <div style="max-width:640px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;">
            <h1 style="color:white;margin:0;font-size:24px;">📊 Session Performance Report</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">${name}'s coding session summary</p>
          </div>
          <div style="padding:40px;">
            <p style="color:#aaa;margin-top:0;">Here's how you did in your latest codeCarft session. Your full report is attached as a PDF.</p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0;">
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;border-left:3px solid #f97316;">
                <p style="color:#666;font-size:12px;margin:0 0 4px;text-transform:uppercase;">Total Solved</p>
                <p style="color:#fff;font-size:32px;font-weight:bold;margin:0;">${data.totalSolved}</p>
              </div>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;border-left:3px solid #22c55e;">
                <p style="color:#666;font-size:12px;margin:0 0 4px;text-transform:uppercase;">Easy</p>
                <p style="color:#22c55e;font-size:32px;font-weight:bold;margin:0;">${data.easySolved}</p>
              </div>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;border-left:3px solid #fbbf24;">
                <p style="color:#666;font-size:12px;margin:0 0 4px;text-transform:uppercase;">Medium</p>
                <p style="color:#fbbf24;font-size:32px;font-weight:bold;margin:0;">${data.mediumSolved}</p>
              </div>
              <div style="background:#0f0f0f;border-radius:8px;padding:20px;border-left:3px solid #ef4444;">
                <p style="color:#666;font-size:12px;margin:0 0 4px;text-transform:uppercase;">Hard</p>
                <p style="color:#ef4444;font-size:32px;font-weight:bold;margin:0;">${data.hardSolved}</p>
              </div>
            </div>

            ${
                data.solvedQuestions.length > 0
                    ? `<h3 style="color:#fff;margin:24px 0 12px;">Problems Solved</h3>
              <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:#f97316;">
                    <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px;">#</th>
                    <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px;">TITLE</th>
                    <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px;">DIFFICULTY</th>
                    <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px;">LANGUAGE</th>
                  </tr>
                </thead>
                <tbody>${questionRows}</tbody>
              </table>`
                    : `<p style="color:#666;text-align:center;margin:24px 0;">No problems solved this session.</p>`
            }

            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="display:inline-block;margin-top:32px;background:#f97316;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;">
              Start Another Session →
            </a>
          </div>
          <div style="border-top:1px solid #222;padding:20px 40px;text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">© ${new Date().getFullYear()} codeCarft AI · Keep Coding, Keep Growing</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.transporter.sendMail({
            from: `"codeCarft Team" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject: `📊 ${name}'s Session Report — ${data.totalSolved} problem${data.totalSolved !== 1 ? "s" : ""} solved`,
            html,
            attachments: [
                {
                    filename: `codeCarft-session-report.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });
    }

    private async send(options: { to: string; subject: string; html: string }) {
        try {
            await this.transporter.sendMail({
                from: `"codeCarft AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                ...options,
            });
        } catch (error) {
            console.error("Email sending failed:", error);
            throw error;
        }
    }
}
