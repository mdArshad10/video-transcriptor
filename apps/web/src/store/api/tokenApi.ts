import { API } from "@/utils/url";
import { baseApi } from "./baseApi";

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyToken: builder.mutation<any, any>({
      query: (body) => ({
        url: API.TOKEN.VERIFY_TOKEN,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Token"],
    }),
    refreshToken:builder.mutation<any,any>({
        query:(body)=>({
            url:API.TOKEN.REFRESH_TOKEN,
            method:"POST",
            data:body
        })
    })
  }),
})

export const {
    useVerifyTokenMutation, 
    useRefreshTokenMutation } = tokenApi;