export const protect = async (req, res, next) => {
    try {
        const authResult = await req.auth();
        const { userId } = authResult;
        if (!userId) {
            return res.json({ success: false, message: "not authenticated" })
        }
        next()
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}