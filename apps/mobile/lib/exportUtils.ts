import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

export type Period = 'day' | 'week' | 'month' | 'quarter' | 'all';

export interface Prospect {
    id: string;
    first_name: string;
    last_name: string;
    company?: string;
    phone?: string;
    address?: string;
    status: string;
    need?: string;
    created_at: string;
    department?: string;
}

export const filterProspectsByPeriod = (prospects: Prospect[], period: Period): Prospect[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return prospects.filter(p => {
        const pDate = new Date(p.created_at);
        
        switch (period) {
            case 'day':
                return pDate >= today;
            case 'week': {
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                return pDate >= lastWeek;
            }
            case 'month': {
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                return pDate >= lastMonth;
            }
            case 'quarter': {
                const lastQuarter = new Date(today);
                lastQuarter.setMonth(today.getMonth() - 3);
                return pDate >= lastQuarter;
            }
            case 'all':
            default:
                return true;
        }
    });
};

export const formatProspectsForSharing = (prospects: Prospect[]): string => {
    if (prospects.length === 0) return "Aucun prospect à partager.";

    return prospects.map(p => {
        return `PROSPECT: ${p.first_name} ${p.last_name}\n` +
               (p.company ? `Entreprise: ${p.company}\n` : '') +
               (p.phone ? `Tél: ${p.phone}\n` : '') +
               (p.address ? `Adresse: ${p.address}\n` : '') +
               `Statut: ${p.status}\n` +
               (p.need ? `Besoin: ${p.need}\n` : '') +
               `-------------------`;
    }).join('\n\n');
};

export const copyToClipboard = async (prospects: Prospect[]) => {
    const text = formatProspectsForSharing(prospects);
    await Clipboard.setStringAsync(text);
};

export const shareAsText = async (prospects: Prospect[]) => {
    const text = formatProspectsForSharing(prospects);
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('', { dialogTitle: 'Partager les prospects', mimeType: 'text/plain', UTIType: 'public.plain-text' });
        // Note: expo-sharing shareAsync with content string is not directly supported on all platforms 
        // using native sharing for text is often done via Share.share from react-native
    }
};

export const exportToPDF = async (prospects: Prospect[], title: string) => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
          .logo { color: #4f46e5; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .title { font-size: 20px; color: #64748b; }
          .meta { font-size: 14px; color: #94a3b8; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; color: #475569; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
          .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">BRICK GO</div>
          <div class="title">${title}</div>
          <div class="meta">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
          <div class="meta">${prospects.length} prospect(s) trouvé(s)</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nom / Entreprise</th>
              <th>Contact</th>
              <th>Adresse</th>
              <th>Statut / Besoin</th>
            </tr>
          </thead>
          <tbody>
            ${prospects.map(p => `
              <tr>
                <td>
                  <strong>${p.first_name} ${p.last_name}</strong><br/>
                  <span style="color: #64748b; font-size: 12px;">${p.company || '-'}</span>
                </td>
                <td>${p.phone || '-'}</td>
                <td>${p.address || '-'}</td>
                <td>
                  <span class="status">${p.status}</span><br/>
                  <span style="color: #64748b; font-size: 12px;">${p.need || '-'}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Document généré via l'application mobile BRICK GO.
        </div>
      </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
