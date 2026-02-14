import { leadstateApi } from "./leadstateApi.js";

export const propertiesApi = leadstateApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params) => ({
        url: "/properties",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: "Property", id: _id })),
            { type: "Property", id: "LIST" },
          ]
          : [{ type: "Property", id: "LIST" }],
    }),
    getProperty: builder.query({
      query: (id) => ({ url: `/properties/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Property", id }],
    }),
    getPropertiesByContact: builder.query({
      query: (contactId) => ({ url: `/properties/contact/${contactId}` }),
      providesTags: (_result, _err, contactId) => [{ type: "Property", id: `contact-${contactId}` }],
    }),
    createProperty: builder.mutation({
      query: (body) => ({ url: "/properties", method: "POST", data: { ...body, status: "inquiry" } }),
      invalidatesTags: [{ type: "Property", id: "LIST" }],
    }),
    updateProperty: builder.mutation({
      query: ({ id, data }) => ({ url: `/properties/${id}`, method: "PATCH", data }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Property", id }],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetPropertiesByContactQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} = propertiesApi;
