import fs from "fs/promises";

const deleteImage = async (userImagePath) => {
    try {
        await fs.access(userImagePath)
        await fs.unlink(userImagePath)
        console.log("User iamge was deleted")
    } catch (error) {
        console.error("User image does not exist")
    }
}

export default deleteImage;