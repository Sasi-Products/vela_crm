import { useAuth } from "../context/AuthContext";

export default function usePermission(permission) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}
