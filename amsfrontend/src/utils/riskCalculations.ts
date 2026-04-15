export const toNumber = (v: any): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export const calculateCurrentRating = (likelihood: any, severity: any): number => {
  return toNumber(likelihood) * toNumber(severity);
};

export const calculateMitigationRating = (likelihood: any, severity: any): number => {
  return toNumber(likelihood) * toNumber(severity);
};

export const recalcWorkItem = (wi: any): any => {
  const updated = { ...wi };

  updated.current_rating = calculateCurrentRating(
    wi.current_likelihood,
    wi.current_severity
  );

  updated.mitigation_rating = calculateMitigationRating(
    wi.mitigation_likelihood,
    wi.mitigation_severity
  );

  return updated;
};

//  COLOR CODING (green / yellow / red)
export const riskColor = (rating: number): string => {
  if (rating >= 15) return "text-red-600 font-bold";      // High risk
  if (rating >= 6) return "text-yellow-600 font-semibold"; // Medium risk
  return "text-green-600 font-semibold";                   // Low risk
};
