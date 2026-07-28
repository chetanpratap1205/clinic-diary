export type PatientExtendedData = {
  notes: string;
  bloodGroup: string;
  email: string;
  emergencyContact: string;
  allergies: string;
  chronicConditions: string;
};

export function parsePatientExtendedData(raw: string | null | undefined): PatientExtendedData {
  if (!raw) {
    return {
      notes: "",
      bloodGroup: "",
      email: "",
      emergencyContact: "",
      allergies: "",
      chronicConditions: "",
    };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return {
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
        bloodGroup: typeof parsed.bloodGroup === "string" ? parsed.bloodGroup : "",
        email: typeof parsed.email === "string" ? parsed.email : "",
        emergencyContact: typeof parsed.emergencyContact === "string" ? parsed.emergencyContact : "",
        allergies: typeof parsed.allergies === "string" ? parsed.allergies : "",
        chronicConditions: typeof parsed.chronicConditions === "string" ? parsed.chronicConditions : "",
      };
    }
  } catch {
    // If it's plain text from older version
  }
  return {
    notes: raw,
    bloodGroup: "",
    email: "",
    emergencyContact: "",
    allergies: "",
    chronicConditions: "",
  };
}

export function serializePatientExtendedData(data: PatientExtendedData): string {
  return JSON.stringify(data);
}
