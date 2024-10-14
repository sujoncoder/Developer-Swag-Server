import fs from "fs/promises";


// DELETE IMAGE WHEN ANY DELETE ACTION
const deleteImage = async (userImagePath) => {
    try {
        await fs.access(userImagePath)
        await fs.unlink(userImagePath)
        console.log("Image was deleted")
    } catch (error) {
        console.error("Image does not exist or could not be deleted")
        throw error;
    }
};

export default deleteImage;