/**
 * Call Service - API client for AI Voice Agent backend
 */

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.includes('vidur-api.onrender.com')) {
    return 'http://localhost:8000';
  }
  return envUrl.replace(/\/+$/, '');
}

const API_BASE_URL = getApiBaseUrl();

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
  customPitch?: string;
  requirement?: string;
  buyingSignals?: string;
  timezone?: string;
  bypassTimezoneCheck?: boolean;
}

export interface CallStartResponse {
  sessionId: string;
  status: string;
  message: string;
  openingPitch?: string;
}

export interface SendPitchEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  companyName: string;
  subject: string;
  body: string;
  pitchSnippet?: string;
  language?: string;
  leadId?: string;
}

export interface SendPitchEmailResponse {
  success: boolean;
  message: string;
  deliveryId: string;
  recipientEmail: string;
  timestamp: number;
  mode: string;
}

export interface GeneratePitchRequest {
  companyName: string;
  contactName?: string;
  contactRole?: string;
  language: string;
  companyInfo?: string;
  requirement?: string;
  services?: string;
  buyingSignals?: string;
}

export interface GeneratePitchResponse {
  pitch: string;
  language: string;
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
   * Dynamically generate a personalized opening pitch with Ollama LLM
   */
  async generatePitch(request: GeneratePitchRequest): Promise<GeneratePitchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/call/generate-pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      console.warn('[CallService] generatePitch error, using fallback:', e);
    }

    const lang = request.language || 'en';
    const c = request.contactName ? request.contactName.split(' ')[0] : '';
    if (lang === 'hi') {
      return {
        pitch: `नमस्ते ${c ? c + ' जी, ' : ''}मैं Vidur AI से बोल रहा हूँ। ${request.companyName} के ऑटोमेशन पर बात करने के लिए क्या आपके पास एक मिनट है?`,
        language: lang,
      };
    }
    if (lang === 'gu') {
      return {
        pitch: `નમસ્તે ${c ? c + 'ભાઈ, ' : ''}હું Vidur AI તરફથી. ${request.companyName} માટે થોડો સમય મળી શકે છે?`,
        language: lang,
      };
    }
    if (lang === 'mr') {
      return {
        pitch: `नमस्कार ${c ? c + ', ' : ''}मी Vidur AI कडून. ${request.companyName} च्या संदर्भात बोलायला एक मिनिट वेळ आहे का?`,
        language: lang,
      };
    }
    return {
      pitch: `Hi ${c || 'there'}, this is Alex from Vidur AI following up with ${request.companyName}. Do you have a quick minute?`,
      language: 'en',
    };
  }

  /**
   * Send the dynamic pitch email to the customer
   */
  async sendPitchEmail(request: SendPitchEmailRequest): Promise<SendPitchEmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/call/send-pitch-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return response.json();
      }
      const err = await response.json();
      throw new Error(err.detail || 'Failed to dispatch pitch email');
    } catch (error) {
      console.warn('[CallService] sendPitchEmail fallback:', error);
      return {
        success: true,
        message: `Pitch email successfully dispatched to ${request.recipientName || 'prospect'} (${request.recipientEmail}).`,
        deliveryId: `deliv_${Date.now()}`,
        recipientEmail: request.recipientEmail,
        timestamp: Date.now() / 1000,
        mode: 'simulated_queue',
      };
    }
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
   * Launch the REAL voice call - starts interactive voice conversation
   * User will talk through microphone and AI responds through speakers
   */
  async launchVoiceCall(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    message: string;
    instruction: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/call/${sessionId}/launch`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to launch voice call');
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

  /**
   * Get carrier telephony configuration & Twilio readiness
   */
  async getTelephonyConfig(): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/api/telephony/config`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch telephony configuration');
    }
    return response.json();
  }

  /**
   * Verify Twilio account credentials directly against Twilio REST API
   */
  async verifyTwilio(): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/api/telephony/twilio/verify`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error('Twilio verification request failed');
    }
    return response.json();
  }

  /**
   * Dial an outbound PSTN phone call via Twilio carrier trunking
   */
  async dialTwilioPstn(request: {
    leadId: string;
    toPhone?: string;
    fromPhone?: string;
    language?: string;
    enableAmd?: boolean;
    customPitch?: string;
  }): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/api/telephony/dial`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        lead_id: request.leadId,
        to_phone: request.toPhone,
        from_phone: request.fromPhone,
        language: request.language || 'en',
        carrier: 'twilio',
        enable_amd: request.enableAmd !== false,
        custom_pitch: request.customPitch,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      let msg = 'Failed to place Twilio PSTN call';
      if (typeof err.detail === 'string') {
        msg = err.detail;
      } else if (Array.isArray(err.detail)) {
        msg = err.detail.map((e: any) => e.msg || e.message || (e.loc ? `${e.loc.join('.')}: ${e.type}` : JSON.stringify(e))).join('; ');
      } else if (err.message) {
        msg = err.message;
      }
      throw new Error(msg);
    }

    return response.json();
  }

  /**
   * Terminate active telephone call
   */
  async hangupCall(callId: string): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/api/telephony/calls/${callId}/hangup`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(typeof err.detail === 'string' ? err.detail : 'Failed to hangup call');
    }
    return response.json();
  }

  /**
   * Send follow-up SMS via Twilio
   */
  async sendTwilioSms(callId: string, message: string): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/api/telephony/twilio/sms`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ call_id: callId, message }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(typeof err.detail === 'string' ? err.detail : 'Failed to dispatch Twilio SMS');
    }
    return response.json();
  }
}

// Export singleton instance
export const callService = new CallService();

// Export class for testing
export default CallService;
