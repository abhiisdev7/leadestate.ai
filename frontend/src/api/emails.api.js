import { leadstateApi } from "./leadstateApi.js";

export const emailsApi = leadstateApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmails: builder.query({
      query: (params) => ({
        url: "/emails",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: "Email", id: _id })),
            { type: "Email", id: "LIST" },
          ]
          : [{ type: "Email", id: "LIST" }],
    }),
    getEmailsByContact: builder.query({
      query: (contactId) => ({ url: `/emails/contact/${contactId}` }),
      providesTags: (_result, _err, contactId) => [{ type: "Email", id: `contact-${contactId}` }],
    }),
    getConversation: builder.query({
      query: (conversationId) => ({ url: `/emails/conversation/${conversationId}` }),
      providesTags: (_result, _err, conversationId) => [{ type: "Email", id: `conv-${conversationId}` }],
    }),
    getEmailsByCampaign: builder.query({
      query: (campaignId) => ({ url: `/emails/campaign/${campaignId}` }),
      providesTags: (_result, _err, campaignId) => [{ type: "Email", id: `campaign-${campaignId}` }],
    }),
  }),
});

export const {
  useGetEmailsQuery,
  useGetEmailsByContactQuery,
  useGetConversationQuery,
  useGetEmailsByCampaignQuery,
} = emailsApi;
