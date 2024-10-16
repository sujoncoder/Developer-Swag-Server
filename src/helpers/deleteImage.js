import fs from "fs/promises";


// DELETE IMAGE WHEN ANY DELETE ACTION
const deleteImage = async (userImagePath) => {
    try {
        await fs.access(userImagePath)
        await fs.unlink(userImagePath)
    } catch (error) {
        throw error;
    }
};

export default deleteImage;