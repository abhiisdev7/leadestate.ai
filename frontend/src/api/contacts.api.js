import { leadstateApi } from "./leadstateApi.js";

export const contactsApi = leadstateApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: (params) => ({
        url: "/contacts",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: "Contact", id: _id })),
            { type: "Contact", id: "LIST" },
          ]
          : [{ type: "Contact", id: "LIST" }],
    }),
    getContact: builder.query({
      query: (id) => ({ url: `/contacts/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Contact", id }],
    }),
    createContact: builder.mutation({
      query: (body) => ({ url: "/contacts", method: "POST", data: body }),
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),
    updateContact: builder.mutation({
      query: ({ id, data }) => ({ url: `/contacts/${id}`, method: "PATCH", data }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Contact", id }],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
} = contactsApi;
