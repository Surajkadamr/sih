import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();
export default async function handler(request, res) {
  if (request.method === "POST") {
    const body = await request.body;
    const input = body.input;
    const lang = body.lang;
    // Upload a file with an "assistants" purpose
    // const file = await openai.files.create({
    //   file: fs.createReadStream("public/knowledge.pdf"),
    //   purpose: "assistants",
    // });

    try {
      if (lang === "English") {
        // const assistant = await openai.beta.assistants.create({
        //   instructions: "You are an AI assistant designed to provide assistance and guidance to users on the employment services platform www.pgrkam.com and its mobile application. Your role is to offer support in navigating various modules and addressing queries related to job-seeking and employer services. Users may seek information on private sector jobs, government jobs, self-employment avenues, foreign jobs, foreign study, counseling, guidance, induction into armed forces, job melas, and other related topics. Your objective is to provide helpful and relevant information to assist users effectively. Begin the conversation by understanding the user's query and guiding them to the appropriate section of the platform.whenever you are asking user how can i help you respond with what your capable of based on the above information.",
        //   model: "gpt-4-1106-preview",
        //   tools: [{ "type": "retrieval" }],
        //   file_ids: [file.id]
        // })
        // const thread = await openai.beta.threads.create()
        // const messages = await openai.beta.threads.messages.create(
        //   thread.id,
        //   {
        //     role: "user",
        //     content: input,
        //     file_ids: [file.id]
        //   }
        // );
        // const run = await openai.beta.threads.runs.create(
        //   thread.id,
        //   { assistant_id: assistant.id, instructions: "You are an AI assistant designed to provide assistance and guidance to users on the employment services platform www.pgrkam.com and its mobile application. Your role is to offer support in navigating various modules and addressing queries related to job-seeking and employer services. Users may seek information on private sector jobs, government jobs, self-employment avenues, foreign jobs, foreign study, counseling, guidance, induction into armed forces, job melas, and other related topics. Your objective is to provide helpful and relevant information to assist users effectively. Begin the conversation by understanding the user's query and guiding them to the appropriate section of the platform.whenever you are asking user how can i help you respond with what your capable of based on the above information.", }
        // );
        // let run1 = await openai.beta.threads.runs.retrieve(
        //   thread.id,
        //   run.id
        // );
        // console.log(run1);
        // while (run1.status !== "completed") {
        //   setInterval(async () => {
        //     run1 = await openai.beta.threads.runs.retrieve(
        //       thread.id,
        //       run.id
        //     );
        //     console.log(run1);
        //   }, 2000);
        // }
        // console.log(run1);
        // const response = await openai.beta.threads.messages.list(thread.id);
        try {
          const completion = await openai.chat.completions.create({
            messages: [{ "role": "system", "content": "You are an AI assistant designed to provide assistance and guidance to users on the employment services platform www.pgrkam.com and its mobile application. Your role is to offer support in navigating various modules and addressing queries related to job-seeking and employer services. Users may seek information on private sector jobs, government jobs, self-employment avenues, foreign jobs, foreign study, counseling, guidance, induction into armed forces, job melas, and other related topics. Your objective is to provide helpful and relevant information to assist users effectively. Begin the conversation by understanding the user's query and guiding them to the appropriate section of the platform.whenever you are asking user how can i help you respond with what your capable of based on the above information. repaly within 100 words if you think it is mandatory use more you can use." },
            { "role": "user", "content": input }],
            model: "gpt-4-0314",
          });
          // let txtrec = "";
          // const decoder = new TextDecoder();
          // for await (const chunk of completion.body) {
          //   const data = decoder.decode(chunk);
          //   const isdata = data.split("\n\n");
          //   isdata.map((data) => {
          //     try {
          //       const jd = JSON.parse(data.replace("data: ", ""));
          //       if (jd["choices"][0]["delta"]["content"]) {
          //         const txt = ["choices"][0]["delta"]["content"];
          //         txtrec += txt;
          //         res.write(`data:${txt}\n\n`)
          //       }
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   })
          // }
          // res.end();
          // return;
          return res.status(200).json(completion.choices[0].message.content);
        } catch (err) {
          console.log(err);
          res.status(500).json({ err });
        }

      } else if (lang === "Hindi") {
        const completion = await openai.chat.completions.create({
          messages: [{ "role": "system", "content": "You are an AI assistant designed to provide assistance and guidance to users on the employment services platform www.pgrkam.com and its mobile application. Your role is to offer support in navigating various modules and addressing queries related to job-seeking and employer services. Users may seek information on private sector jobs, government jobs, self-employment avenues, foreign jobs, foreign study, counseling, guidance, induction into armed forces, job melas, and other related topics. Your objective is to provide helpful and relevant information to assist users effectively. Begin the conversation by understanding the user's query and guiding them to the appropriate section of the platform.whenever you are asking user how can i help you respond with what your capable of based on the above information.Answer any qusetion asked by user in Hindi." },
          { "role": "user", "content": input }],
          model: "gpt-4-0314",
        });
        return res.status(200).json(completion.choices[0].message.content);
      } else {
        const completion = await openai.chat.completions.create({
          messages: [{ "role": "system", "content": "You are an AI assistant designed to provide assistance and guidance to users on the employment services platform www.pgrkam.com and its mobile application. Your role is to offer support in navigating various modules and addressing queries related to job-seeking and employer services. Users may seek information on private sector jobs, government jobs, self-employment avenues, foreign jobs, foreign study, counseling, guidance, induction into armed forces, job melas, and other related topics. Your objective is to provide helpful and relevant information to assist users effectively. Begin the conversation by understanding the user's query and guiding them to the appropriate section of the platform.whenever you are asking user how can i help you respond with what your capable of based on the above information.Answer any qusetion asked by user in punjabi." },
          { "role": "user", "content": input }],
          model: "gpt-4-0314",
        });
        return res.status(200).json(completion.choices[0].message.content);
      }
    } catch (err) {
      console.log(err);
      let error = "Unexpected message";
      if (err instanceof Error) {
        error = err.message;
      }
      return res.status(200).json(error);
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
