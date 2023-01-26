import type { NextApiRequest, NextApiResponse } from "next";

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    if (req.method === "POST") {
        const data = req.body;
        try {
            await fetch("https://connect.mailerlite.com/api/subscribers", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${mailerToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: data }),
            });
            return res.status(200).json({ success: true });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
    return res.status(400).json({ message: "Bad request" });
};

export default handler;
