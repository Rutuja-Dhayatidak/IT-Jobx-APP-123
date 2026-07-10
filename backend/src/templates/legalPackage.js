const formatCurrency = require("../utils/formatCurrency");

/**
 * Generates high-fidelity HTML for the Master Legal Package
 */
const generateLegalHTML = (data) => {
    const { provider, client, contract } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: 'Georgia', serif;
            color: #1a1f2e;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        .sans { font-family: 'Arial', sans-serif; }
        
        /* Layout Utilities */
        .page-break { page-break-before: always; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .mb-20 { margin-bottom: 20px; }
        .mt-40 { margin-top: 40px; }
        
        /* Header Section */
        header {
            background: #1a1f2e;
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        header h1 {
            font-family: 'Arial', sans-serif;
            font-size: 24pt;
            margin: 0 0 15px 0;
            letter-spacing: 2px;
        }
        .header-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            font-size: 9pt;
            border-top: 1px solid #334155;
            padding-top: 15px;
        }
        .header-item span { display: block; color: #94a3b8; margin-bottom: 4px; }
        .header-item strong { color: #f8fafc; }

        /* Parties Section */
        .parties-container {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .party-box { width: 45%; }
        .party-label { font-size: 8pt; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
        .party-name { font-size: 13pt; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
        .party-details { font-size: 9pt; color: #475569; }
        .separator { font-size: 20pt; color: #cbd5e1; font-weight: lighter; }

        /* Section Headers */
        section { margin-top: 30px; }
        .section-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .section-title { font-size: 16pt; font-weight: bold; color: #0f172a; }
        .badge {
            font-size: 8pt;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-blue { background: #eff6ff; color: #1e40af; }
        .badge-purple { background: #faf5ff; color: #6b21a8; }
        .badge-green { background: #f0fdf4; color: #166534; }
        .badge-amber { background: #fffbeb; color: #92400e; }

        /* Clauses */
        .clause { margin-bottom: 15px; font-size: 10pt; text-align: justify; }
        .clause-title { font-weight: bold; color: #1e293b; margin-bottom: 5px; display: block; }
        
        /* Tables & Grids */
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
        }
        .grid-cell { padding: 12px 15px; border: 0.5px solid #f1f5f9; }
        .grid-cell label { display: block; font-size: 8pt; color: #64748b; margin-bottom: 3px; }
        .grid-cell value { font-size: 10pt; font-weight: bold; color: #1e293b; }

        /* Signature Section */
        .signature-section { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .sig-box { border-top: 1px solid #cbd5e1; padding-top: 15px; }
        .sig-line { height: 50px; border: 1px dashed #f1f5f9; margin-bottom: 15px; border-radius: 4px; }
        .sig-label { font-size: 9pt; font-weight: bold; color: #64748b; margin-bottom: 10px; }
        .sig-detail { font-size: 9pt; color: #475569; margin-bottom: 4px; }

        /* Footer */
        footer {
            margin-top: 50px;
            font-size: 8pt;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
        }
    </style>
</head>
<body>

    <header class="sans">
        <h1>MASTER LEGAL PACKAGE</h1>
        <div class="header-grid">
            <div class="header-item"><span>DOCUMENT DATE</span><strong>${contract.date}</strong></div>
            <div class="header-item"><span>CONTRACT PERIOD</span><strong>${contract.period_start} – ${contract.period_end}</strong></div>
            <div class="header-item"><span>CONTRACT VALUE</span><strong>${formatCurrency(contract.total_amount)}</strong></div>
            <div class="header-item"><span>REF NUMBER</span><strong>${contract.ref_number}</strong></div>
        </div>
    </header>

    <div class="parties-container mb-20">
        <div class="party-box">
            <div class="party-label sans">SERVICE PROVIDER</div>
            <div class="party-name sans">${provider.company_name}</div>
            <div class="party-details">${provider.address}<br>GSTIN: ${provider.gstin}</div>
        </div>
        <div class="separator sans">×</div>
        <div class="party-box">
            <div class="party-label sans">CLIENT</div>
            <div class="party-name sans">${client.company_name}</div>
            <div class="party-details">${client.address}<br>GSTIN: ${client.gstin}</div>
        </div>
    </div>

    <!-- SECTION 1: MSA -->
    <section>
        <div class="section-header sans">
            <div class="section-title">1. Master Service Agreement (MSA)</div>
            <div class="badge badge-blue">Required</div>
        </div>
        <div class="clause">
            This Master Service Agreement ("Agreement") defines the relationship where ITjobx provides enterprise-grade recruitment technology and related services to the Client.
        </div>
        <div class="grid-cell" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 20px;">
                <div><span class="clause-title">1.1 Service Scope</span>ITjobx will provide full access to the AI-driven sourcing engine, ATS, and interview management dashboard.</div>
                <div><span class="clause-title">1.2 Payment Terms</span>Payment is due ${contract.payment_terms}. Non-payment within 30 days may result in suspension.</div>
            </div>
        </div>
        <div class="clause">
            <span class="clause-title">1.3 Governing Law</span> This Agreement is governed by the ${contract.governing_law}.
        </div>
        <div class="summary-grid sans">
            <div class="grid-cell"><label>Liability Cap</label><value>100% of Annual Fee</value></div>
            <div class="grid-cell"><label>Notice Period</label><value>${contract.notice_period}</value></div>
        </div>
    </section>

    <div class="page-break"></div>

    <!-- SECTION 2: DPA -->
    <section>
        <div class="section-header sans">
            <div class="section-title">2. Data Processing Addendum (DPA)</div>
            <div class="badge badge-purple">Required</div>
        </div>
        <div class="clause">
            This DPA ensures compliance with data protection regulations. ITjobx acts as a Data Processor for the Client.
        </div>
        <div class="grid-cell" style="background: #fdfaff; border: 1px solid #f3e8ff; border-radius: 8px; margin-bottom: 20px;">
            <div class="clause"><span class="clause-title">2.1 Infrastructure</span> Servers located in AWS Mumbai region with redundant backups.</div>
            <div class="clause"><span class="clause-title">2.2 Security</span> Data encrypted at rest (AES-256) and in transit (TLS 1.3). SOC2 compliance protocols followed.</div>
            <div class="clause"><span class="clause-title">2.3 Notification</span> Security breaches will be notified within 72 hours of discovery.</div>
        </div>
    </section>

    <!-- SECTION 3: SLA -->
    <section>
        <div class="section-header sans">
            <div class="section-title">3. Service Level Agreement (SLA)</div>
            <div class="badge badge-green">Required</div>
        </div>
        <div class="summary-grid sans" style="margin-bottom: 20px;">
            <div class="grid-cell"><label>UPTIME GUARANTEE</label><value>${contract.uptime_guarantee}</value></div>
            <div class="grid-cell"><label>MAX DOWNTIME/YEAR</label><value>8.77 Hours</value></div>
            <div class="grid-cell"><label>SUPPORT RESPONSE</label><value>${contract.support_response}</value></div>
            <div class="grid-cell"><label>PENALTY</label><value>5% Credit per 1% breach</value></div>
        </div>
        <div class="clause">ITjobx provides high-availability services. Critical support tickets are prioritized with 24/7 coverage for Enterprise clients.</div>
    </section>

    <!-- SECTION 4: NDA -->
    <section>
        <div class="section-header sans">
            <div class="section-title">4. Non-Disclosure Agreement (NDA)</div>
            <div class="badge badge-amber">Recommended</div>
        </div>
        <div class="clause">
            Both parties agree to protect "Confidential Information" including trade secrets, pricing, and business strategies. 
            This obligation survives for ${contract.nda_duration} after termination.
        </div>
    </section>

    <!-- SIGNATURES -->
    <div class="signature-section sans">
        <div class="sig-box">
            <div class="sig-label">AUTHORIZED SIGNATORY (CLIENT)</div>
            <div class="sig-line"></div>
            <div class="sig-detail"><strong>${client.company_name}</strong></div>
            <div class="sig-detail">${client.signatory_name} / ${client.signatory}</div>
            <div class="sig-detail" style="font-size: 7pt; color: #94a3b8; margin-top: 10px;">Company Seal Required</div>
        </div>
        <div class="sig-box">
            <div class="sig-label">AUTHORIZED SIGNATORY (ITjobx)</div>
            <div class="sig-line"></div>
            <div class="sig-detail"><strong>${provider.company_name}</strong></div>
            <div class="sig-detail">${provider.signatory_name} / ${provider.signatory}</div>
            <div class="sig-detail" style="font-size: 7pt; color: #94a3b8; margin-top: 10px;">Company Seal Required</div>
        </div>
    </div>

    <footer>
        <div class="sans" style="font-weight: bold; margin-bottom: 5px; color: #475569;">${contract.ref_number} — Generated on ${new Date().toLocaleDateString()}</div>
        This document is a legally binding offer generated by the ITjobx Sales Engine. 
        Acceptance of the proposal constitutes intent to sign this package.
        <br>&copy; 2026 ITjobx Technologies Pvt Ltd. All rights reserved.
    </footer>

</body>
</html>
    `;
};

module.exports = { generateLegalHTML };
