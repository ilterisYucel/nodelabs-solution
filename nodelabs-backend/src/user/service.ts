import { User, UserDocument } from "@/user/model";

const createUser = async (
  data: Partial<UserDocument>
): Promise<UserDocument> => {
  return await User.create(data);
};

const getAllUsers = async (): Promise<UserDocument[]> => {
  return (await User.find({}).lean()) as UserDocument[];
};

const getUser = async (id: string): Promise<UserDocument | null> => {
  return (await User.findById(id, {}).lean()) as UserDocument | null;
};

const updateUser = async (
  id: string,
  updatedData: Partial<UserDocument>
): Promise<UserDocument | null> => {
  return (await User.findByIdAndUpdate(id, updatedData, {
    new: true,
  }).lean()) as UserDocument | null;
};

const filterUser = async (filter: any): Promise<UserDocument | null> => {
  const f = { ...filter };
  return (await User.findOne(f).lean()) as UserDocument | null;
};

const filterUsers = async (filter: any): Promise<UserDocument[] | null> => {
  const f = { ...filter };
  return (await User.find(f).lean()) as UserDocument[] | null;
};

const deleteUser = async (id: string) => {
  return await User.deleteOne({ id });
};

export {
  createUser,
  deleteUser,
  filterUser,
  filterUsers,
  getAllUsers,
  getUser,
  updateUser,
};
