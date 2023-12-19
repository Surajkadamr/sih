import fs from "fs";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI();


export default async function handler(req, res) {
    if (req.method === "POST") {
        const body = await req.body;
        const base64Audio = body.audio;
        const lang = body.lang;
        const audio = Buffer.from(base64Audio, "base64");
        const filePath = "tmp/input.wav";
        try {
            fs.writeFileSync(filePath, audio);
            const readStream = fs.createReadStream(filePath);
            if (lang === "English") {
                const data = await openai.audio.transcriptions.create({
                    file: readStream,
                    model: "whisper-1",
                    language: "en"
                });
                fs.unlinkSync(filePath);
                return res.status(200).json(data);
            } else {
                const data = await openai.audio.transcriptions.create({
                    file: readStream,
                    model: "whisper-1",
                    language: "hi"
                });
                fs.unlinkSync(filePath);
                return res.status(200).json(data);
            }

        } catch (error) {
            console.error("Error processing audio:", error);
            return NextResponse.error();
        }
    }
}