import { Navigate, useLocation } from "react-router";

/** Redirection permanente d'un alias de menu vers la route canonique, en conservant ?tab= et #ancre. */
export function RedirectKeepingQuery({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
}
