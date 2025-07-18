import { Conversation, ConversationDocument } from "@/conversation/model";

const createConversation = async (
  data: Partial<ConversationDocument>
): Promise<ConversationDocument> => {
  return (await Conversation.create(data)) as unknown as ConversationDocument;
};

const getAllConversations = async (): Promise<ConversationDocument[]> => {
  return (await Conversation.find({}).lean()) as ConversationDocument[];
};

const getConversation = async (
  id: string
): Promise<ConversationDocument | null> => {
  return (await Conversation.findById(
    id,
    {}
  ).lean()) as ConversationDocument | null;
};

const updateConversation = async (
  id: string,
  updatedData: Partial<ConversationDocument>
): Promise<ConversationDocument | null> => {
  return (await Conversation.findByIdAndUpdate(id, updatedData, {
    new: true,
  }).lean()) as ConversationDocument | null;
};

const filterConversation = async (
  filter: any
): Promise<ConversationDocument | null> => {
  const f = { ...filter };
  return (await Conversation.findOne(f).lean()) as ConversationDocument | null;
};

const filterConversations = async (
  filter: any
): Promise<ConversationDocument[] | null> => {
  const f = { ...filter };
  return (await Conversation.find(f).lean()) as ConversationDocument[] | null;
};

const deleteConversation = async (id: string) => {
  return await Conversation.deleteOne({ id });
};

export {
  createConversation,
  getAllConversations,
  getConversation,
  updateConversation,
  filterConversation,
  filterConversations,
  deleteConversation,
};
