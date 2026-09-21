export interface PasswordCriteria {
  id: string;
  label: string;
  recommendation: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 - 4
  level: "Sangat Lemah" | "Lemah" | "Cukup" | "Baik" | "Sangat Kuat";
  color: string;
  textColor: string;
  isValid: boolean;
  criteria: PasswordCriteria[];
  unmetCriteria: PasswordCriteria[];
}

/**
 * Validasi password murni JavaScript / TypeScript dengan regex,
 * diselaraskan 1:1 dengan backend schema (auth.schema.ts).
 */
export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  const criteria: PasswordCriteria[] = [
    {
      id: "length",
      label: "Min. 8 karakter",
      recommendation: "Minimal 8 karakter",
      met: password.length >= 8,
    },
    {
      id: "upper",
      label: "Huruf besar (A-Z)",
      recommendation: "Huruf besar (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lower",
      label: "Huruf kecil (a-z)",
      recommendation: "Huruf kecil (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Angka (0-9)",
      recommendation: "Angka (0-9)",
      met: /[0-9]/.test(password),
    },
    {
      id: "symbol",
      label: "Simbol khusus (!@#$...)",
      recommendation: "Simbol khusus (!@#$...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const unmetCriteria = criteria.filter((c) => !c.met);
  const metCount = criteria.length - unmetCriteria.length;
  const isValid = unmetCriteria.length === 0;

  if (!password) {
    return {
      score: 0,
      level: "Sangat Lemah",
      color: "bg-slate-200",
      textColor: "text-slate-400",
      isValid: false,
      criteria,
      unmetCriteria,
    };
  }

  let score = 1;
  let level: PasswordStrengthResult["level"] = "Lemah";
  let color = "bg-rose-500";
  let textColor = "text-rose-500";

  if (metCount <= 2) {
    score = 1;
    level = "Lemah";
    color = "bg-rose-500";
    textColor = "text-rose-500";
  } else if (metCount === 3) {
    score = 2;
    level = "Cukup";
    color = "bg-amber-500";
    textColor = "text-amber-600";
  } else if (metCount === 4) {
    score = 3;
    level = "Baik";
    color = "bg-sky-500";
    textColor = "text-sky-600";
  } else if (metCount === 5) {
    score = 4;
    level = "Sangat Kuat";
    color = "bg-emerald-500";
    textColor = "text-emerald-600";
  }

  return {
    score,
    level,
    color,
    textColor,
    isValid,
    criteria,
    unmetCriteria,
  };
};

