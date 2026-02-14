import { leadstateApi } from "./leadstateApi.js";

export const campaignsApi = leadstateApi.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: (params) => ({
        url: "/campaigns",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: "Campaign", id: _id })),
            { type: "Campaign", id: "LIST" },
          ]
          : [{ type: "Campaign", id: "LIST" }],
    }),
    getCampaign: builder.query({
      query: (id) => ({ url: `/campaigns/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Campaign", id }],
    }),
    createCampaign: builder.mutation({
      query: (body) => ({ url: "/campaigns", method: "POST", data: body }),
      invalidatesTags: [{ type: "Campaign", id: "LIST" }],
    }),
    sendCampaign: builder.mutation({
      query: (id) => ({ url: `/campaigns/${id}/send`, method: "POST" }),
      invalidatesTags: (_result, _err, id) => [{ type: "Campaign", id }],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useSendCampaignMutation,
} = campaignsApi;
