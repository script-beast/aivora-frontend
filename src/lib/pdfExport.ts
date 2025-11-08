import { api } from "./api";

/**
 * Export goal report as PDF by calling the backend API
 * The backend generates the PDF and sends it as a downloadable file
 */
export async function exportGoalReport(goalId: string): Promise<void> {
  try {
    const { blob, filename } = await api.downloadGoalReport(goalId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Get report blob for preview purposes
 */
export async function getReportBlob(goalId: string): Promise<Blob> {
  try {
    const { blob } = await api.downloadGoalReport(goalId);
    return blob;
  } catch (error) {
    console.error('Failed to get PDF blob:', error);
    throw new Error('Failed to generate PDF report');
  }
}

