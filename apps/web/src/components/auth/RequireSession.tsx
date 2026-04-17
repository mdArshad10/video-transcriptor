import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { clearAccessToken, selectAccessToken, setAccessToken } from '@/store/auth/accessTokenStore';
import { useRefreshTokenMutation } from '@/store/api/tokenApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const RequireSession = () => {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    let active = true;

    const restore = async () => {
      if (accessToken) {
        if (active) {
          setStatus('ready');
        }
        return;
      }

      try {
        const response = await refreshToken({}).unwrap();
        dispatch(setAccessToken(response?.accessToken ?? null));

        if (active) {
          setStatus('ready');
        }
      } catch {
        dispatch(clearAccessToken());
        if (active) {
          setStatus('failed');
        }
      }
    };

    void restore();

    return () => {
      active = false;
    };
  }, [accessToken, dispatch, location.pathname, refreshToken]);

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
