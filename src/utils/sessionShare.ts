import { ModuleId } from '../types';

export interface SharedSessionData {
  version: number;
  timestamp: number;
  activeModule: ModuleId;
  firstOrder?: {
    K: number;
    tau: number;
    theta: number;
    A: number;
  };
  secondOrder?: {
    inputMode: 'poly' | 'canonical';
    b0: number;
    a1: number;
    a0: number;
    K_can: number;
    zeta_can: number;
    wn_can: number;
    stepAmp: number;
  };
  circuits?: {
    circuitType: 'RC' | 'RL' | 'RLC';
    rVal: number;
    rUnit: number;
    cVal: number;
    cUnit: number;
    lVal: number;
    lUnit: number;
    vIn: number;
  };
  stepByStep?: {
    systemOrder: '1st' | '2nd';
    a1: number;
    a0: number;
    b0: number;
    A: number;
    a2: number;
    a1_2: number;
    a0_2: number;
    b0_2: number;
  };
  pid?: {
    plantK: number;
    plantTau: number;
    Kp: number;
    Ki: number;
    Kd: number;
    setpoint: number;
    tSim: number;
    controllerMode: 'P' | 'PI' | 'PD' | 'PID';
  };
  bode?: {
    systemType: '1st' | '2nd';
    K: number;
    tau: number;
    wn: number;
    zeta: number;
    freqMinExp: number;
    freqMaxExp: number;
    probeFreq: number;
  };
}

/**
 * Gather current application state from localStorage or defaults
 */
export function getCurrentSessionState(activeModule: ModuleId): SharedSessionData {
  const getJson = (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  };

  return {
    version: 1,
    timestamp: Date.now(),
    activeModule,
    firstOrder: getJson('autocontrol_first_order_delay_params'),
    secondOrder: getJson('autocontrol_second_order_exam_params'),
    circuits: getJson('autocontrol_circuit_blackboard_params'),
    stepByStep: getJson('autocontrol_stepbystep_params'),
    pid: getJson('autocontrol_pid_params'),
    bode: getJson('autocontrol_bode_params'),
  };
}

/**
 * Encode session data into a compact safe base64 string
 */
export function encodeSessionState(data: SharedSessionData): string {
  try {
    const jsonStr = JSON.stringify(data);
    // UTF-8 safe base64
    const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    // Base64URL safe
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Error encoding session state:', err);
    return '';
  }
}

/**
 * Decode session data from base64 string
 */
export function decodeSessionState(encoded: string): SharedSessionData | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
      b64 += '=';
    }
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonStr) as SharedSessionData;
    if (parsed && parsed.version && parsed.activeModule) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Error decoding session state:', err);
    return null;
  }
}

/**
 * Apply shared session data to localStorage
 */
export function applySessionState(data: SharedSessionData): void {
  try {
    if (data.firstOrder) {
      localStorage.setItem('autocontrol_first_order_delay_params', JSON.stringify(data.firstOrder));
    }
    if (data.secondOrder) {
      localStorage.setItem('autocontrol_second_order_exam_params', JSON.stringify(data.secondOrder));
    }
    if (data.circuits) {
      localStorage.setItem('autocontrol_circuit_blackboard_params', JSON.stringify(data.circuits));
    }
    if (data.stepByStep) {
      localStorage.setItem('autocontrol_stepbystep_params', JSON.stringify(data.stepByStep));
    }
    if (data.pid) {
      localStorage.setItem('autocontrol_pid_params', JSON.stringify(data.pid));
    }
    if (data.bode) {
      localStorage.setItem('autocontrol_bode_params', JSON.stringify(data.bode));
    }
    if (data.activeModule) {
      localStorage.setItem('autocontrol_platinum_active_module', JSON.stringify(data.activeModule));
    }
  } catch (err) {
    console.error('Error applying session state:', err);
  }
}

/**
 * Check URL for session token on startup
 */
export function checkUrlForSession(): SharedSessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check hash: #session=XYZ or #share=XYZ
    const hash = window.location.hash;
    const hashMatch = hash.match(/#(?:session|share)=([A-Za-z0-9_-]+)/);
    if (hashMatch && hashMatch[1]) {
      return decodeSessionState(hashMatch[1]);
    }

    // 2. Check query params: ?session=XYZ or ?share=XYZ
    const urlParams = new URLSearchParams(window.location.search);
    const queryVal = urlParams.get('session') || urlParams.get('share');
    if (queryVal) {
      return decodeSessionState(queryVal);
    }
  } catch (e) {
    console.warn('Error reading session from URL:', e);
  }

  return null;
}

/**
 * Generate full share URL
 */
export function generateShareUrl(activeModule: ModuleId): string {
  const state = getCurrentSessionState(activeModule);
  const hash = encodeSessionState(state);
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}#session=${hash}`;
}
