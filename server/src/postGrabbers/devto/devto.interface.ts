import * as yup from 'yup';

const rawPostFieldSchema = yup.object({
  title: yup.string(),
  path: yup.string(),
  main_image: yup.string().nullable(),
  tag_list: yup.array(yup.string()),
  id: yup.number(),
  published_at_int: yup.number(),
  public_reactions_count: yup.number(),
});

export const DevtoRawDataSchema = yup.object({
  result: yup.array(rawPostFieldSchema),
});

export type DevtoRawPost = Required<yup.InferType<typeof rawPostFieldSchema>>;

export type DevtoRawData = Required<yup.InferType<typeof DevtoRawDataSchema>>;
