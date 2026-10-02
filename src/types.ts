export type ModuleId =
  | 'first_order_delay'
  | 'second_order_exam'
  | 'circuits'
  | 'algebraic_tutor'
  | 'pid_lab'
  | 'bode_analysis'
  | 'matlab_csv'
  | 'glossary_quiz'
  // Compatibility aliases
  | 'fundamentals'
  | 'laplace_bridge'
  | 'systems_analysis'
  | 'block_simulink'
  | 'csv_lab'
  | 'glossary_exam'
  | 'theory'
  | 'stepbystep'
  | 'simulator'
  | 'pid'
  | 'bode'
  | 'blockdiagram'
  | 'matlab'
  | 'csvloader'
  | 'circuit_tutor'
  | 'circuit_blackboard'
  | 'canonical'
  | 'simulink';

export type CircuitType = 'RC' | 'RL' | 'RLC';
export type CircuitTopology = 'series' | 'parallel';

export interface ModuleInfo {
  id: ModuleId;
  number: string;
  title: string;
  subtitle: string;
}

export interface CanonicalParams {
  systemOrder: '1st' | '2nd';
  a1: number;
  a0: number;
  b0: number;
  A: number;
  a2: number;
  a1_2: number;
  a0_2: number;
  b0_2: number;
  inputMode?: 'diff_eq' | 'canonical';
  wn?: number;
  zeta?: number;
  K2?: number;
}

export interface CircuitBlackboardParams {
  circuitType: CircuitType;
  rVal: number;
  rUnit: number; // e.g. 1 (Ohm), 1000 (kOhm)
  cVal: number;
  cUnit: number; // e.g. 1e-6 (uF), 1e-9 (nF), 1e-12 (pF)
  lVal: number;
  lUnit: number; // e.g. 1e-3 (mH), 1e-6 (uH)
  vIn: number;
}

export interface SimulationParams {
  K: number;
  tau: number;
  wn: number;
  zeta: number;
  systemType: '1st' | '2nd';
  A: number;
  rampSlope: number;
  t_pert: number;
  amp_pert: number;
}

export interface PIDLabParams {
  plantK: number;
  plantTau: number;
  Kp: number;
  Ki: number;
  Kd: number;
  setpoint: number;
  tSim: number;
  controllerMode: 'P' | 'PI' | 'PD' | 'PID';
}

export interface BlockDiagramParams {
  loopMode: 'open' | 'closed';
  K: number;
  tau: number;
  Kp: number;
  H: number;
  inputAmp: number;
  Ki?: number;
  Kd?: number;
  enablePID?: boolean;
}

export interface BodeParams {
  systemType: '1st' | '2nd';
  K: number;
  tau: number;
  wn: number;
  zeta: number;
  freqMinExp: number;
  freqMaxExp: number;
  probeFreq: number;
}

export interface CsvExperimentData {
  t: number;
  u: number;
  y: number;
  y_model?: number;
}
