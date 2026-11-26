import { Navigate } from "react-router-dom";

// El formulario ahora vive en un modal del Muro; esta dirección se conserva
// para enlaces antiguos y simplemente abre ese modal.
export default function MuroEnviar() {
  return <Navigate to="/muro" state={{ share: true }} replace />;
}
