import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import {
  clearAccessToken,
  clearRefreshToken,
  selectAccessToken,
  selectRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/store/auth/accessTokenStore';
import { useRefreshTokenMutation } from '@/store/api/tokenApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const RequireSession = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const [refreshSession] = useRefreshTokenMutation();

  useEffect(() => {
    let active = true;

    const restore = async () => {
      if (accessToken) {
        if (active) {
          setStatus('ready');
        }
        return;
      }

      const storedAccessToken =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (storedAccessToken) {
        dispatch(setAccessToken(storedAccessToken));
        if (active) {
          setStatus('ready');
        }
        return;
      }

      const storedRefreshToken =
        refreshToken ??
        (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);

      if (!storedRefreshToken) {
        dispatch(clearAccessToken());
        dispatch(clearRefreshToken());
        if (active) {
          setStatus('failed');
        }
        return;
      }

      try {
        const response = await refreshSession({ refreshToken: storedRefreshToken }).unwrap();
        const nextAccessToken = response?.accessToken ?? null;
        const nextRefreshToken = response?.refreshToken ?? storedRefreshToken;

        if (!nextAccessToken) {
          throw new Error('Refresh response did not include an access token.');
        }

        dispatch(setAccessToken(nextAccessToken));
        dispatch(setRefreshToken(nextRefreshToken));

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', nextAccessToken);
          localStorage.setItem('refreshToken', nextRefreshToken);
        }

        if (active) {
          setStatus('ready');
        }
      } catch {
        dispatch(clearAccessToken());
        dispatch(clearRefreshToken());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        if (active) {
          setStatus('failed');
        }
      }
    };

    void restore();

    return () => {
      active = false;
    };
  }, [accessToken, dispatch, refreshSession, refreshToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-display">Restoring session...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return <Navigate to="/auth-error" replace />;
  }

  return <Outlet />;
};

export default RequireSession;
