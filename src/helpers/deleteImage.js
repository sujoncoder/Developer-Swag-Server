import fs from "fs/promises";

const deleteImage = async (userImagePath) => {
    try {
        await fs.access(userImagePath)
        await fs.unlink(userImagePath)
        console.log("User image was deleted")
    } catch (error) {
        console.error("User image does not exist or could not be deleted")
        throw error;
    }
}

export default deleteImage;