/**
 * Renders docs/database-schema.png from an SVG snapshot of docs/database-schema.drawio.
 * Used when draw.io desktop / Docker headless export is unavailable.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "docs", "database-schema.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#333333"/>
    </marker>
  </defs>
  <rect width="1200" height="900" fill="#ffffff"/>

  <rect x="40" y="20" width="920" height="36" rx="4" fill="#fff9e6" stroke="none"/>
  <text x="48" y="42" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    Условные обозначения: PK — первичный ключ · FK — внешний ключ · UQ — уникальность · onDelete: Cascade / SetNull
  </text>

  <rect x="40" y="80" width="280" height="100" fill="#fff2cc" stroke="#d6b656"/>
  <text x="48" y="96" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">BankSettings</tspan><tspan> (таблица по смыслу одна строка)</tspan>
    <tspan x="48" dy="14">──────────────</tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">PK</tspan> id String @default(&quot;global&quot;)</tspan>
    <tspan x="48" dy="14">    annualSchedulePercent Float</tspan>
    <tspan x="48" dy="14">    updatedAt DateTime @updatedAt</tspan>
  </text>

  <rect x="380" y="80" width="300" height="90" fill="#f5f5f5" stroke="#666666"/>
  <text x="390" y="96" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">Перечисления (enum в PostgreSQL)</tspan>
    <tspan x="390" dy="14">Role: OPERATOR | ADMIN</tspan>
    <tspan x="390" dy="14">LeadStatus: NEW | IN_PROGRESS | CLOSED</tspan>
    <tspan x="390" dy="14">ChatSessionStatus: OPEN | CLOSED</tspan>
    <tspan x="390" dy="14">SenderRole: VISITOR | OPERATOR</tspan>
  </text>

  <rect x="40" y="200" width="300" height="170" fill="#d5e8d4" stroke="#82b366"/>
  <text x="48" y="216" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">Lead</tspan>
    <tspan x="48" dy="14">──────────────</tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">PK</tspan> id String @id</tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">FK</tspan> assignedOperatorId String? → BankOperator</tspan>
    <tspan x="48" dy="14">    lastName, firstName String</tspan>
    <tspan x="48" dy="14">    phone String</tspan>
    <tspan x="48" dy="14">    source String @default(&quot;product&quot;)</tspan>
    <tspan x="48" dy="14">    status LeadStatus</tspan>
    <tspan x="48" dy="14">    createdAt, updatedAt DateTime</tspan>
    <tspan x="48" dy="14">    @@index(assignedOperatorId)</tspan>
  </text>

  <rect x="380" y="200" width="300" height="180" fill="#dae8fc" stroke="#6c8ebf"/>
  <text x="388" y="216" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">BankOperator</tspan><tspan> → </tspan><tspan font-style="italic">bank_operators</tspan>
    <tspan x="388" dy="14">──────────────</tspan>
    <tspan x="388" dy="14"><tspan font-weight="bold">PK</tspan> id String @id @default(cuid())</tspan>
    <tspan x="388" dy="14"><tspan font-weight="bold">UQ</tspan> email String</tspan>
    <tspan x="388" dy="14">    lastName, firstName String</tspan>
    <tspan x="388" dy="14">    patronymic String?</tspan>
    <tspan x="388" dy="14">    passwordHash String</tspan>
    <tspan x="388" dy="14">    role Role @default(OPERATOR)</tspan>
    <tspan x="388" dy="14">    createdAt DateTime</tspan>
    <tspan x="388" dy="14">    LAST_LOGIN, LAST_ACTIVITY DateTime?</tspan>
  </text>

  <rect x="40" y="420" width="300" height="150" fill="#e1d5e7" stroke="#9673a6"/>
  <text x="48" y="436" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">ActivityLog</tspan>
    <tspan x="48" dy="14">──────────────</tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">PK</tspan> id String @id</tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">FK</tspan> leadId String → Lead <tspan font-style="italic">Cascade</tspan></tspan>
    <tspan x="48" dy="14"><tspan font-weight="bold">FK</tspan> operatorId String? → BankOperator <tspan font-style="italic">SetNull</tspan></tspan>
    <tspan x="48" dy="14">    type String</tspan>
    <tspan x="48" dy="14">    note Text</tspan>
    <tspan x="48" dy="14">    createdAt DateTime</tspan>
    <tspan x="48" dy="14">    @@index(leadId)</tspan>
  </text>

  <rect x="740" y="200" width="300" height="170" fill="#ffe6cc" stroke="#d79b00"/>
  <text x="748" y="216" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">ChatSession</tspan>
    <tspan x="748" dy="14">──────────────</tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">PK</tspan> id String @id</tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">FK</tspan> leadId String? → Lead <tspan font-style="italic">SetNull</tspan></tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">FK</tspan> assignedOperatorId String? → BankOperator <tspan font-style="italic">SetNull</tspan></tspan>
    <tspan x="748" dy="14">    visitorName, visitorPhone String</tspan>
    <tspan x="748" dy="14">    status ChatSessionStatus</tspan>
    <tspan x="748" dy="14">    createdAt, updatedAt DateTime</tspan>
    <tspan x="748" dy="14">    @@index(status)</tspan>
  </text>

  <rect x="740" y="420" width="300" height="150" fill="#f8cecc" stroke="#b85450"/>
  <text x="748" y="436" font-family="Verdana, Arial, sans-serif" font-size="10" fill="#000000">
    <tspan font-weight="bold">ChatMessage</tspan>
    <tspan x="748" dy="14">──────────────</tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">PK</tspan> id String @id</tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">FK</tspan> sessionId String → ChatSession <tspan font-style="italic">Cascade</tspan></tspan>
    <tspan x="748" dy="14"><tspan font-weight="bold">FK</tspan> operatorId String? → BankOperator <tspan font-style="italic">SetNull</tspan></tspan>
    <tspan x="748" dy="14">    body Text</tspan>
    <tspan x="748" dy="14">    senderRole SenderRole</tspan>
    <tspan x="748" dy="14">    createdAt DateTime</tspan>
    <tspan x="748" dy="14">    @@index(sessionId, createdAt)</tspan>
  </text>

  <g stroke="#333333" stroke-width="2" fill="none">
    <line x1="340" y1="259.5" x2="380" y2="263" marker-end="url(#arr)"/>
    <line x1="190" y1="420" x2="190" y2="370" marker-end="url(#arr)"/>
    <polyline points="340,495 360,495 360,290 380,290" stroke-dasharray="6 4" marker-end="url(#arr)"/>
    <polyline points="740,251 700,251 700,311 340,311" marker-end="url(#arr)"/>
    <polyline points="890,200 890,170 720,170 720,290 680,290" marker-end="url(#arr)"/>
    <line x1="890" y1="420" x2="890" y2="370" marker-end="url(#arr)"/>
    <polyline points="740,495 700,495 700,350 530,350 680,350" stroke-dasharray="6 4" marker-end="url(#arr)"/>
  </g>

  <g font-family="Verdana, Arial, sans-serif" font-size="9" fill="#000000">
    <rect x="350" y="248" width="110" height="14" fill="#ffffff" stroke="none"/>
    <text x="355" y="258">assignedOperatorId</text>
    <rect x="200" y="388" width="40" height="14" fill="#ffffff" stroke="none"/>
    <text x="205" y="398">leadId</text>
    <rect x="365" y="378" width="55" height="14" fill="#ffffff" stroke="none"/>
    <text x="370" y="388">operatorId?</text>
    <rect x="520" y="238" width="45" height="14" fill="#ffffff" stroke="none"/>
    <text x="525" y="248">leadId?</text>
    <rect x="780" y="158" width="110" height="14" fill="#ffffff" stroke="none"/>
    <text x="785" y="168">assignedOperatorId?</text>
    <rect x="900" y="388" width="55" height="14" fill="#ffffff" stroke="none"/>
    <text x="905" y="398">sessionId</text>
    <rect x="600" y="332" width="55" height="14" fill="#ffffff" stroke="none"/>
    <text x="605" y="342">operatorId?</text>
  </g>
</svg>`;

const { Resvg } = await import("@resvg/resvg-js");
const resvg = new Resvg(Buffer.from(svg, "utf8"), {
  fitTo: { mode: "width", value: 2400 },
  font: {
    fontFiles: [],
    loadSystemFonts: true,
  },
});
writeFileSync(outPath, resvg.render().asPng());
console.log("Wrote", outPath);
