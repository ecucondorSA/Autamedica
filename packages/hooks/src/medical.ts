"use client";

import { useState, useEffect } from "react";
import type { Patient, Appointment } from "@autamedica/types";

export function usePatients() {
  const [patients, _setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implementar fetch de pacientes
    setLoading(false);
  }, []);

  return { patients, loading, error };
}

export function useAppointments() {
  const [appointments, _setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implementar fetch de citas
    setLoading(false);
  }, []);

  return { appointments, loading, error };
}