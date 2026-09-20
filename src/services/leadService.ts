import { DiscoveredLead } from '../types/leads';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DiscoverLeadsParams {
  query?: string;
  limit?: number;
}

export class LeadDiscoveryService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Discover leads by calling the backend which searches Google, LinkedIn, etc.
   * No more fake client-side fallback — if backend is down, we show an error.
   */
  async discoverLeads(params: DiscoverLeadsParams = {}): Promise<DiscoveredLead[]> {
    const query = params.query || '';
    const limit = params.limit || 6;

    // Try primary endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/leads/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.leads || [];
      }
    } catch (err) {
      console.warn('[LeadDiscovery] Primary endpoint failed:', err);
    }

    // Try alternate endpoint
    try {
      const altResponse = await fetch(`${this.baseUrl}/api/discover-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit }),
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        return altData.leads || [];
      }
    } catch (err) {
      console.warn('[LeadDiscovery] Alternate endpoint failed:', err);
    }

    // No client-side fallback — throw so the UI shows the error state
    throw new Error(
      'Lead discovery backend is not reachable. Please ensure the backend server is running on ' + this.baseUrl
    );
  }
}

export const leadDiscoveryService = new LeadDiscoveryService();
export default leadDiscoveryService;
