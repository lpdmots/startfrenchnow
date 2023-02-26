import type { NextApiRequest, NextApiResponse } from "next";
import { GiConsoleController } from "react-icons/gi";

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    if (req.method === "GET") {
        const { param: email } = req.query;
        try {
            const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${mailerToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            const subscriber = await response.json();
            return res.status(200).json({ subscriber });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    if (req.method === "PUT") {
        const { param: subscriberId } = req.query;
        const { fields, groups } = req.body;
        try {
            const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${mailerToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ fields: fields, groups: groups }),
            });
            const updated = await response.json();
            return res.status(200).json({ updated });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
    return res.status(400).json({ message: "Bad request" });
};

export default handler;
