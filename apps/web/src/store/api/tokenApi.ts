import { API } from "@/utils/url";
import { baseApi } from "./baseApi";

interface TokenResponse {
  accessToken?: string | null;
  refreshToken?: string | null;
}

interface VerifyTokenBody {
  token: string;
}

interface RefreshTokenBody {
  refreshToken?: string | null;
}

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyToken: builder.mutation<TokenResponse, VerifyTokenBody>({
      query: (body) => ({
        url: API.TOKEN.VERIFY_TOKEN,
        method: "POST",
        data: body,
        skipAuthRefresh: true,
      }),
      invalidatesTags: ["Token"],
    }),
    refreshToken:builder.mutation<TokenResponse, RefreshTokenBody | void>({
        query:(body)=>{
          const storedRefreshToken =
            body?.refreshToken ??
            (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);

          return {
            url:API.TOKEN.REFRESH_TOKEN,
            method:"POST",
            data:{ refreshToken: storedRefreshToken },
            skipAuthRefresh: true,
          };
        }
    })
  }),
})

export const {
    useVerifyTokenMutation, 
    useRefreshTokenMutation } = tokenApi;
