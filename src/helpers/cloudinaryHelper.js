export const publicIdWithOutExtention = async (imageUrl) => {
    try {
        const pathSegments = imageUrl.split("/");

        const lastSegment = pathSegments[pathSegments.length - 1];

        const valueWithOutExtention = lastSegment.split(".")[0];

        return valueWithOutExtention;
    } catch (error) {
        throw error
    }
};
