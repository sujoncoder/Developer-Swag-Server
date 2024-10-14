import User from "../models/userModel.js";


// CHECK_USER_EXIST
const checkUserExist = async (email) => {
    return await User.exists({ email: email });
};

export default checkUserExist;