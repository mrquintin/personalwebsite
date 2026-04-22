// Domain parameter table per CE4 §3.1.
// alpha derived as 1/(2*gamma); stored to four decimals so CSreq is computed
// from the closed form rather than display rounding.
export type DomainKey = "market_economics" | "governance" | "public_health";

export const DOMAIN_PARAMS: Record<DomainKey, { CSd0: number; gamma: number; alpha: number; Sdmin: number }> = {
  market_economics: { CSd0: 0.18, gamma: 2.0, alpha: 0.25, Sdmin: 50000 },
  governance: { CSd0: 0.20, gamma: 2.2, alpha: 0.2273, Sdmin: 50000 },
  public_health: { CSd0: 0.22, gamma: 2.4, alpha: 0.2083, Sdmin: 50000 },
};

export const DOMAIN_LABEL: Record<DomainKey, string> = {
  market_economics: "market_economics",
  governance: "governance",
  public_health: "public_health",
};
