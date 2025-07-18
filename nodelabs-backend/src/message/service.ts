import { Message, MessageDocument } from "@/message/model";

const createMessage = async (
  data: Partial<MessageDocument>
): Promise<MessageDocument> => {
  return (await Message.create(data)) as unknown as MessageDocument;
};

const getAllMessages = async (): Promise<MessageDocument[]> => {
  return (await Message.find({}).lean()) as MessageDocument[];
};

const getMessage = async (id: string): Promise<MessageDocument | null> => {
  return (await Message.findById(id, {}).lean()) as MessageDocument | null;
};

const updateMessage = async (
  id: string,
  updatedData: Partial<MessageDocument>
): Promise<MessageDocument | null> => {
  return (await Message.findByIdAndUpdate(id, updatedData, {
    new: true,
  }).lean()) as MessageDocument | null;
};

const filterMessage = async (filter: any): Promise<MessageDocument | null> => {
  const f = { ...filter };
  return (await Message.findOne(f).lean()) as MessageDocument | null;
};

const filterMessages = async (
  filter: any
): Promise<MessageDocument[] | null> => {
  const f = { ...filter };
  return (await Message.find(f).lean()) as MessageDocument[] | null;
};

const deleteMessage = async (id: string) => {
  return await Message.deleteOne({ id });
};

export {
  createMessage,
  getAllMessages,
  getMessage,
  updateMessage,
  filterMessage,
  filterMessages,
  deleteMessage,
};
