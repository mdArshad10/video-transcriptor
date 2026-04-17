import { useSelector } from 'react-redux';
import { selectAccessToken } from './accessTokenStore';

export function useAccessToken(): string | null {
  return useSelector(selectAccessToken);
}
