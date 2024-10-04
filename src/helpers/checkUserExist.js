import User from "../models/userModel.js";

const checkUserExist = async (email) => {
    return await User.exists({ email: email });
}

export default checkUserExist;