/**
 * Call Service - API client for AI Voice Agent backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CallStartRequest {
  leadId: string;
  companyName: string;
  contactName: string;
  contactRole?: string;
  contactPhone?: string;
  language?: string;
  companyInfo?: string;
  services?: string;
  goal?: string;
}

export interface CallStartResponse {
  sessionId: string;
  status: string;
  message: string;
}

export interface TranscriptItem {
  speaker: 'agent' | 'prospect';
  text: string;
  timestamp: number;
  language: string;
}

export interface CallStatusResponse {
  sessionId: string;
  status: 'connecting' | 'ringing' | 'live' | 'paused' | 'completed' | 'failed';
  duration: number;
  transcript: TranscriptItem[];
  currentObjective?: string;
}

export interface MessageRequest {
  sessionId: string;
  message: string;
  language?: string;
}

export interface MessageResponse {
  sessionId: string;
  response: string;
  language: string;
  timestamp: number;
}

export interface CallSummary {
  duration_seconds: number;
  total_turns: number;
  language: string;
  lead_info: {
    interest_level: string;
    callback_requested: boolean;
    meeting_scheduled: boolean;
    objections: string[];
  };
  bant_score: {
    score: number;
    max_score: number;
  };
  transcript: string;
}

export interface CallEndResponse {
  sessionId: string;
  status: string;
  summary: CallSummary;
  duration: number;
}

class CallService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the backend API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get backend configuration
   */
  async getConfig() {
    const response = await fetch(`${this.baseUrl}/api/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    return response.json();
  }

  /**
   * Start a new call session
   */
  async startCall(request: CallStartRequest): Promise<CallStartResponse> {
    const response = await fetch(`${this.baseUrl}/api/call/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start call');
    }

    return response.json();
  }

  /**
   * Connect the call and get opening message
   */
  async connectCall(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    opening: string;
    language: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/call/${sessionId}/connect`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to connect call');
    }

    return response.json();
  }

  /**
   * Get current call status
   */
  async getCallStatus(sessionId: string): Promise<CallStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/call/${sessionId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get call status');
    }

    return response.json();
  }

  /**
   * Send a text message during the call
   */
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/call/${request.sessionId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * End the call and get summary
   */
  async endCall(sessionId: string): Promise<CallEndResponse> {
    const response = await fetch(`${this.baseUrl}/api/call/${sessionId}/end`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to end call');
    }

    return response.json();
  }

  /**
   * Delete a call session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/call/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete session');
    }
  }

  /**
   * List all active sessions
   */
  async listSessions(): Promise<{
    sessions: Array<{
      sessionId: string;
      leadId: string;
      companyName: string;
      contactName: string;
      status: string;
      duration: number;
      transcriptLength: number;
    }>;
    count: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/sessions`);

    if (!response.ok) {
      throw new Error('Failed to list sessions');
    }

    return response.json();
  }

  /**
   * Create a WebSocket connection for real-time communication
   */
  createWebSocket(sessionId: string): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws');
    return new WebSocket(`${wsUrl}/ws/call/${sessionId}`);
  }
}

// Export singleton instance
export const callService = new CallService();

// Export class for testing
export default CallService;
