const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const { emitNotification } = require('../utils/socketService');

/**
 * Initializes and schedules background subscription cron audit tasks
 */
const startSubscriptionCron = () => {
  // Schedule to run every single day at 12:00 Midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Scheduler] Running daily subscription validation sweep... 🔍');
    try {
      const now = new Date();

      // --- 1. SEND 7-DAY EXPIRATION REMINDER EMAILS ---
      const sevenDaysLaterStart = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
      const sevenDaysLaterEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const expiringSoon = await Subscription.find({
        status: 'active',
        expiryDate: { $gte: sevenDaysLaterStart, $lte: sevenDaysLaterEnd }
      }).populate('companyId');

      for (const sub of expiringSoon) {
        if (sub.companyId) {
          const email = sub.companyId.official_work_email || sub.companyId.email;
          const subject = `Your ITjobx Plan Expires in 7 Days! ⏰`;
          const text = `Hi, your B2B subscription will expire in 7 days. Log in to renew!`;
          const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
              <h2 style="color: #6366f1; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Plan Expiring Soon ⏰</h2>
              <p>Dear <strong>${sub.companyId.contact_person_name}</strong>,</p>
              <p>Your ITjobx <strong>${sub.planType.toUpperCase()}</strong> subscription will expire on <strong>${new Date(sub.expiryDate).toLocaleDateString()}</strong> (in 7 days).</p>
              <p>If you have enabled <strong>auto-renewal</strong>, our gateway will attempt payment on your card automatically. Otherwise, please renew manually inside your dashboard settings.</p>
              <a href="http://localhost:5173/employer/billing" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 16px 0;">Renew Plan Now</a>
              <p style="color: #64748b; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 0;">Need help? Contact billing@ITjobx.co</p>
            </div>
          `;
          try {
            await sendEmail(email, subject, text, html);
            console.log(`[Cron] Sent 7-day expiration reminder to: ${email}`);
          } catch (e) {
            console.error(`[Cron] Failed to send 7-day reminder to ${email}`, e);
          }
        }
      }

      // --- 2. AUDIT EXPIRED TIER LOGS (RENEW OR SUSPEND) ---
      const expiredSubs = await Subscription.find({
        status: 'active',
        expiryDate: { $lt: now }
      }).populate('companyId planId');

      for (const sub of expiredSubs) {
        if (!sub.companyId) continue;

        const company = sub.companyId;
        const email = company.official_work_email || company.email;

        // Auto-renew system
        if (sub.autoRenew && sub.planId) {
          console.log(`[Cron] Executing card auto-debit renewal process for: ${company.name} 💸`);

          try {
            const plan = sub.planId;
            const subtotal = plan.price;
            const gstAmount = Math.round((subtotal * 0.18) * 100) / 100;
            const totalAmount = subtotal + gstAmount;

            const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
            const transactionId = `auto_${Date.now().toString().slice(-6)}`;

            // Create completed Payment log
            const payment = new Payment({
              employerId: company.owner_user_id,
              companyId: company._id,
              plan: plan._id,
              amount: totalAmount,
              subtotal,
              gstAmount,
              status: 'completed',
              transactionStatus: 'completed',
              paymentMethod: 'auto-debit',
              transactionId,
              invoiceUrl: `/api/payments/invoices/download/${invoiceNumber}`
            });
            await payment.save();

            // Create Invoice
            const invoice = new Invoice({
              invoiceNumber,
              companyId: company._id,
              planName: plan.plan_name,
              subtotal,
              gstAmount,
              totalAmount,
              pdfUrl: `/api/payments/invoices/download/${invoiceNumber}`,
              issuedDate: new Date(),
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              paymentId: payment._id
            });
            await invoice.save();

            // Extend active dates on subscription
            sub.startDate = new Date();
            sub.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            sub.invoiceId = invoice._id;
            await sub.save();

            // Sync parent company parameters
            company.plan_started_at = sub.startDate;
            company.plan_expires_at = sub.expiryDate;
            company.plan_status = 'active';
            await company.save();

            // Build PDF layout on local storage
            const { generateInvoicePDF } = require('../utils/invoiceGenerator');
            let absolutePdfPath = '';
            try {
              absolutePdfPath = await generateInvoicePDF({
                invoiceNumber,
                companyName: company.name,
                gstin: company.gst_number || 'N/A',
                billingAddress: company.company_location || 'Corporate Office',
                billingEmail: company.official_work_email || company.email,
                planName: plan.plan_name,
                subtotal,
                gstAmount,
                totalAmount,
                transactionId,
                paymentMethod: 'Auto Debit (Saved Card)',
                issuedDate: sub.startDate,
                expiryDate: sub.expiryDate
              });
            } catch (pdfErr) {
              console.error("[Cron] Auto PDF generation failed:", pdfErr);
            }

            // Mail success confirmation
            const successHtml = `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
                <h2 style="color: #10b981; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Subscription Auto-Renewed! ✔</h2>
                <p>Dear <strong>${company.contact_person_name}</strong>,</p>
                <p>Excellent news! Your B2B subscription for the <strong>ITjobx ${plan.plan_name}</strong> plan was successfully auto-renewed via credit card billing.</p>
                <p>Your subscription features are active for another 30 days until <strong>${sub.expiryDate.toLocaleDateString()}</strong>.</p>
                <p>Your tax invoice <strong>${invoiceNumber}</strong> is compiled and attached to this email.</p>
                <p style="color: #64748b; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 0;">ITjobx Billing, Mumbai</p>
              </div>
            `;

            const attachments = [];
            if (absolutePdfPath) {
              attachments.push({ filename: `${invoiceNumber}.pdf`, path: absolutePdfPath });
            }

            await sendEmail(
              email,
              `ITjobx Subscription Auto-Renewed - ${invoiceNumber}`,
              `Subscription auto-renewed successfully! Invoice attached.`,
              successHtml,
              attachments
            );

            emitNotification(`company_${company._id}`, 'subscription_updated', {
              planName: plan.plan_name,
              status: 'active',
              expiresAt: sub.expiryDate
            });

            console.log(`[Cron] Successfully renewed plan for: ${company.name}`);

          } catch (autoRenewErr) {
            console.error(`[Cron] Auto debit failed for ${company.name}. Initializing Grace Period. ⚠️`, autoRenewErr);

            // AUTO-DEBIT FAILED -> INTRODUCE 7 DAYS GRACE PERIOD
            const graceExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Log failed payment
            const failedPayment = new Payment({
              employerId: company.owner_user_id,
              companyId: company._id,
              amount: sub.planId ? sub.planId.price : 0,
              status: 'failed',
              transactionStatus: 'failed',
              paymentMethod: 'auto-debit',
              failureReason: 'Saved payment credentials authorization failed. Bank transaction declined.'
            });
            await failedPayment.save();

            // Keep status as active but extend date to grace limit, suspend auto-renew trigger to avoid loop
            sub.expiryDate = graceExpiry;
            sub.autoRenew = false; // suspend auto-debits until employer updates billing card
            await sub.save();

            const warningHtml = `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; color: #1e293b; background-color: #fffbfe;">
                <h2 style="color: #dc2626; font-weight: 800; border-bottom: 2px solid #fecaca; padding-bottom: 12px; margin-top: 0;">Payment Failed - Grace Period Active ⚠️</h2>
                <p>Dear <strong>${company.contact_person_name}</strong>,</p>
                <p>Our billing systems were unable to auto-renew your ITjobx subscription because the transaction was declined by your bank.</p>
                <p>To keep your workflows smooth, we have initiated a <strong>7-Day Grace Period</strong> on your corporate account. Your features will remain active until <strong>${graceExpiry.toLocaleDateString()}</strong>. Please log in to manually complete your renewal before this date to prevent plan suspension.</p>
                <a href="http://localhost:5173/employer/billing" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 16px 0;">Update Card & Pay</a>
                <p style="color: #64748b; font-size: 12px; border-top: 1px solid #fecaca; padding-top: 12px; margin-bottom: 0;">Urgent attention requested. Billing Support: billing@ITjobx.co</p>
              </div>
            `;

            await sendEmail(
              email,
              `URGENT: ITjobx Subscription Auto-Debit Failed! ⚠️`,
              `Payment failed. 7-Day Grace Period initiated to preserve features.`,
              warningHtml
            );

            emitNotification('finance_admin', 'new_payment_failed', {
              companyName: company.name,
              reason: 'Bank decline on auto-debit (Grace initiated)'
            });
          }

        } else {
          // NO AUTO-RENEW ENABLED OR GRACE PERIOD EXPIRED -> SUSPEND PLAN
          sub.status = 'inactive';
          await sub.save();

          company.plan_status = 'expired';
          company.plan_type = 'free'; // fall back to basic free tier limits
          await company.save();

          const suspendHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; color: #1e293b;">
              <h2 style="color: #dc2626; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Premium Plan Suspended ❌</h2>
              <p>Dear <strong>${company.contact_person_name}</strong>,</p>
              <p>Your B2B subscription has expired, and your corporate account has been downgraded to the <strong>Free Trial</strong> tier.</p>
              <p>Corporate seats, resume download capabilities, and advanced filters are now locked. Any active job listings exceeding the free tier maximum limit (2 active jobs) have been temporarily hidden.</p>
              <a href="http://localhost:5173/employer/billing" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 16px 0;">Upgrade Plan Now</a>
              <p style="color: #64748b; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 0;">Contact sales@ITjobx.co for enterprise inquiries.</p>
            </div>
          `;

          await sendEmail(
            email,
            `ITjobx Subscription Expired - Downgraded to Free Trial ❌`,
            `Your plan has expired. Premium access has been suspended.`,
            suspendHtml
          );

          emitNotification(`company_${company._id}`, 'subscription_updated', {
            planName: 'Free Trial',
            status: 'inactive'
          });

          console.log(`[Cron] Suspended expired subscription for company: ${company.name}`);
        }
      }

    } catch (err) {
      console.error('[Cron Error] Subscription sweeping module failure:', err);
    }
  });
};

module.exports = { startSubscriptionCron };
