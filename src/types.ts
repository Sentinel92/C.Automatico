export type ModuleId =
  | 'theory'
  | 'stepbystep'
  | 'circuits'
  | 'simulator'
  | 'pid'
  | 'bode'
  | 'blockdiagram'
  | 'matlab'
  | 'csvloader';

export interface CanonicalParams {
  systemOrder: '1st' | '2nd';
  // 1st order aliases
  a?: number;
  b?: number;
  c?: number;
  a1: number;
  a0: number;
  b0: number;
  A: number; // Step magnitude
  // 2nd order: a2*y'' + a1_2*y' + a0_2*y = b0_2*r
  a2: number;
  a1_2: number;
  a0_2: number;
  b0_2: number;
  // Direct specs mode
  inputMode: 'diff_eq' | 'parameters';
  wn: number; // Natural frequency (rad/s)
  zeta: number; // Damping ratio
  K2: number; // DC gain for 2nd order
}

export interface BlockDiagramParams {
  loopMode: 'open' | 'closed';
  K: number; // Plant DC Gain
  tau: number; // Plant Time Constant (s)
  Kp: number; // Proportional Controller Gain
  Ki?: number; // Integral Controller Gain
  Kd?: number; // Derivative Controller Gain
  enablePID?: boolean;
  H: number; // Sensor Feedback Gain (usually 1.0)
  inputAmp: number; // Reference Step Amplitude R(s)
}

export type CircuitType = 'RC' | 'RL' | 'RLC';

export interface CircuitStorageState {
  circuitType: CircuitType;
  rVal: number;
  rUnit: number;
  cVal: number;
  cUnit: number;
  lVal: number;
  lUnit: number;
  vIn: number;
  activeTfId: string;
}

export interface SimulationParams {
  K: number; // Steady-state gain
  tau: number; // Time constant (s)
  wn: number; // Natural frequency for 2nd order
  zeta: number; // Damping ratio for 2nd order
  systemType: '1st' | '2nd';
  A: number; // Step amplitude
  rampSlope: number; // Ramp input slope (default 1)
  t_pert: number; // Disturbance injection time (s)
  amp_pert: number; // Disturbance amplitude
  t_max?: number; // Total simulation time
}

export interface PIDLabParams {
  plantK: number; // Plant DC gain K
  plantTau: number; // Plant time constant tau
  Kp: number; // Proportional gain
  Ki: number; // Integral gain
  Kd: number; // Derivative gain
  setpoint: number; // Reference step amplitude
  tSim: number; // Total simulation duration
  controllerMode: 'P' | 'PI' | 'PID';
}

export interface BodeParams {
  systemType: '1st' | '2nd';
  K: number; // DC Gain
  tau: number; // 1st order time constant
  wn: number; // 2nd order natural frequency
  zeta: number; // 2nd order damping ratio
  freqMinExp: number; // 10^(freqMinExp), e.g. -2 -> 0.01 rad/s
  freqMaxExp: number; // 10^(freqMaxExp), e.g. 3 -> 1000 rad/s
  probeFreq: number; // Probe frequency for sinusoidal time response
}

export interface CsvExperimentData {
  t: number;
  u: number;
  y: number;
  yModel?: number;
}
