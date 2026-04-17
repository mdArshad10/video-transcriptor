import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { clearAccessToken, setAccessToken } from '@/store/auth/accessTokenStore';
import { useVerifyTokenMutation } from '@/store/api/tokenApi';
import { useAppDispatch } from '@/store/hooks';

const JwtLandingPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [verifyToken] = useVerifyTokenMutation();
  const isRef = useRef(false);
  debugger;

  useEffect(() => {
    if (isRef.current) return;
    const bootstrap = async () => {
      if (!token) {
        navigate('/auth-error', { replace: true });
        return;
      }
      debugger;

      isRef.current = true;
      try {
        debugger;
        const response = await verifyToken({ token }).unwrap();
        debugger;
        dispatch(setAccessToken(response?.accessToken ?? null));
        navigate('/', { replace: true });
      } catch {
        debugger;
        dispatch(clearAccessToken());
        navigate('/auth-error', { replace: true });
      }
    };

    void bootstrap();
  }, [dispatch, navigate, token, verifyToken]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-display">Verifying secure token...</p>
    </div>
  );
};

export default JwtLandingPage;
