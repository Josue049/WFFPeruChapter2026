const TOKEN_KEY = "wff_campus_token";

export function getCampusToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setCampusToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Sin almacenamiento: la sesión dura mientras la pestaña siga abierta.
  }
}

export function clearCampusToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada que limpiar.
  }
}
