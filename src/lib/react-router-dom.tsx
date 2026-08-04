/**
 * Compatibility shim: exposes the small react-router-dom surface used by the
 * ported HistorIA pages on top of TanStack Router.
 */
import { useEffect, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import {
  Outlet,
  useParams as useTanstackParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';

export { Outlet };

type NavigateOptions = { replace?: boolean; state?: unknown };

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (typeof window !== 'undefined') window.history.go(to);
      return;
    }
    void router.navigate({ to: to as never, replace: options?.replace });
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useParams<T = Record<string, string>>(): T {
  return useTanstackParams({ strict: false } as never) as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const router = useRouter();
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const params = new URLSearchParams(search ?? '');
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const usp = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const obj: Record<string, string> = {};
    usp.forEach((value, key) => {
      obj[key] = value;
    });
    void router.navigate({ to: '.' as never, search: obj as never, replace: true });
  };
  return [params, setParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    void router.navigate({ to: to as never, replace });
  }, [router, to, replace]);
  return null;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  replace?: boolean;
  children?: ReactNode;
};

export function Link({ to, replace, onClick, children, ...rest }: LinkProps) {
  const router = useRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (rest.target && rest.target !== '_self') return;
    event.preventDefault();
    void router.navigate({ to: to as never, replace });
  };
  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export const NavLink = Link;
