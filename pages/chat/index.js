"use client";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Roboto } from "next/font/google";
import ChatMessage from "./ChatMessage";
import "@fontsource/raleway"; // Defaults to weight 400
import "@fontsource/raleway/400.css"; // Specify weight
import "@fontsource/raleway/400-italic.css"; // Specify weight and style
import { blobToBase64 } from "@/utils/blobToBase64";
import { createMediaStream } from "@/utils/createMediaStream";

const roboto = Roboto({ weight: ["400"], subsets: ["latin"] });

const Chat = () => {
    const [persona, setPersona] = useState(
        "You are a FinanceGPT, an advanced AI language model specialized in the field of finance. You are here to provide expert insights and navigate complex financial topics. You will provide a thorough and well-reasoned response."
    );
    const [input, setInput] = useState("");
    const [canSend, setCanSend] = useState(true);
    const [output, setOutput] = useState("");
    const [pastMessages, setPastMessages] = useState([]);
    const [error, setError] = useState("");
    const [text, setText] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const isRecording = useRef(false);
    const chunks = useRef([]);

    const startRecording = () => {
        if (mediaRecorder) {
            isRecording.current = true;
            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            isRecording.current = false;
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const getText = async (base64data) => {
        try {
            const response = await fetch("/api/speechtotext", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    audio: base64data,
                    lang : "English"
                }),
            }).then((res) => res.json());
            setProcessing(true);
            setText(true);
            try {
                setCanSend(false);
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input: response.text,
                        lang: "English"
                    }),
                });
                if (res.status !== 200) {
                    throw new Error(`Response status: ${res.statusText}`, res);
                }
                if (!res?.body) {
                    throw new Error("Response has no body.");
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let humanMessage = { text: response.text, type: "human" };
                let aiMessage = { text: "", type: "ai" };
                setInput("");
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const chunk = decoder.decode(value);
                    aiMessage.text = aiMessage.text.concat(chunk);
                    aiMessage.text = aiMessage.text.slice(1, -1);
                }
                reader.cancel();

                // Move setOutput and pastMessages update outside the loop
                setOutput(aiMessage.text);
                setPastMessages((history) => [...history, humanMessage, aiMessage]);
            } catch (err) {
                let message = "Unknown error.";
                if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
                console.error(err);
            } finally {
                setCanSend(true);
            }
            console.log(pastMessages);
        } catch (error) {
            console.log(error);
        }
        setProcessing(false);
    };

    const initialMediaRecorder = (stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            createMediaStream(stream)
            chunks.current = [];
        };

        mediaRecorder.ondataavailable = (ev) => {
            chunks.current.push(ev.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
            blobToBase64(audioBlob, getText);
        };

        setMediaRecorder(mediaRecorder);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(initialMediaRecorder);
        }
    }, []);

    useEffect(() => {
        const messages = window.sessionStorage.getItem("pastMessages");
        if (messages) {
            setPastMessages(JSON.parse(messages));
        }
        const personality = window.sessionStorage.getItem("persona");
        if (personality) {
            setPersona(personality);
        }
    }, []);

    useEffect(() => {
        window.sessionStorage.setItem("pastMessages", JSON.stringify(pastMessages));
    }, [pastMessages]);

    useEffect(() => {
        window.sessionStorage.setItem("persona", persona);
    }, [persona]);

    const outputRef = useRef(null);
    useEffect(() => {
        if (output && outputRef.current) {
            outputRef.current.scrollIntoView(false);
        }
    }, [output]);

    const handleSubmit = useCallback(
        async (e) => {
            setProcessing(true);
            e.preventDefault();
            try {
                setCanSend(false);
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input,
                        lang: "English"
                    }),
                });
                if (res.status !== 200) {
                    throw new Error(`Response status: ${res.statusText}`, res);
                }
                if (!res?.body) {
                    throw new Error("Response has no body.");
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let humanMessage = { text: input, type: "human" };
                let aiMessage = { text: "", type: "ai" };


                setInput("");
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const chunk = decoder.decode(value);
                    aiMessage.text = aiMessage.text.concat(chunk);
                    aiMessage.text = aiMessage.text.slice(1, -1);
                }
                reader.cancel();

                // Move setOutput and pastMessages update outside the loop
                setOutput(aiMessage.text);
                setPastMessages((history) => [...history, humanMessage, aiMessage]);
            } catch (err) {
                let message = "Unknown error.";
                if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
                console.error(err);
            } finally {
                setCanSend(true);
            }
            console.log(pastMessages);
            setText(true);
            setProcessing(false);
        },
        [persona, input]
    );

    const hasHistory = useMemo(() => Boolean(pastMessages.length), [
        pastMessages,
    ]);

    const isDisabled = useMemo(() => !!error || !input || !canSend, [
        input,
        canSend,
        error,
    ]);
    return (
        <div className={`flex container mx-auto bg-white md:h-screen h-fit`}>
            <div className="hidden md:block md:w-110px md:h-full md:p-5 md:bg-[#ed914b]">
                <div className="flex flex-col">
                    <img className="md:w-32 md:block hidden" src="/unnamed.png" />
                </div>
                <div className="text-white flex justify-center my-[100px] mx-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <div className="text-white flex justify-center my-[100px] mx-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                </div>
                <div className="text-white flex justify-center my-[100px] mx-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                </div>
            </div>
            <div className="flex flex-col w-full h-full">
                <h1 className={`justify-center p-2 pb-3 md:shadow-none shadow-lg md:mb-16 flex  md:mt-10 font-bold text-[#c4661F] md:text-3xl leading-tight text-primary text-center`}>
                    <img className="md:hidden w-10 md:mt-0 mt-3 mx-1 h-10" src="/unnamed.png" />
                    <p className="pt-5">PGKRAM CHAT</p>
                </h1>
                <div className=" rounded-lg h-[450px] md:h-screen flex flex-col pt-5 overflow-auto px-4 md:mb-5">
                    {pastMessages.map((message, index) => (
                        <div key={index}>
                            <ChatMessage text={message.text} type={message.type} />
                        </div>
                    ))}
                    {text===false && <div className="text-center">
                        <img src="/unnamed.png" className="w-32 mx-auto" />
                        <h1 className="text-2xl mt-3 font-semibold ml-5">How can I help you today?</h1>
                        <div className="flex justify-center mt-28">
                            <div className="block mx-10"><button onClick={()=>{setInput("Foreign study")}} className="block px-24 py-3 border-2 rounded-2xl my-3">Foreign study</button><button onClick={()=>{setInput("Counseling guidance")}} className="block px-[72px] py-3 border-2 rounded-2xl">Counseling guidance</button></div>
                            <div className="mx-10"><button onClick={()=>{setInput("Private sector jobs")}} className="block px-20 py-3 border-2 my-3 rounded-2xl">Private sector jobs</button><button onClick={()=>{setInput("Government job")}}  className="block px-[88px] py-3 border-2 rounded-2xl">Government job</button></div>
                        </div>
                    </div>}
                    {error && (
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline">{error}</span>
                            <button
                                onClick={() => setError("")}
                                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                type="button"
                            >
                                ✖
                            </button>
                        </div>
                    )}
                    {recording && <button disabled type="button" className=" absolute bottom-28 right-[598px]  py-4 px-8 me-2 text-xl font-medium text-gray-900 bg-white rounded-lg border border-gray-200  inline-flex items-center">
                        <svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-gray-200 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#ed914b" />
                        </svg>
                        Loading...
                    </button>}
                    {processing && <button disabled type="button" className=" absolute bottom-28 right-[598px] py-4 px-8 me-2 text-xl font-medium text-gray-900 bg-white rounded-lg border border-gray-200  inline-flex items-center">
                        <svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-gray-200 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#ed914b" />
                        </svg>
                        Processing...
                    </button>}
                </div>
                <div className="absolute md:bottom-8 bottom-10 md:relative rounded-lg md:p-6 p-4 md:h-24">
                    <div className="flex justify-center md:ml-20">
                        <input
                            type="text"
                            className="w-3/4 rounded-3xl border-[#c4461F] px-8 border-2 my-2 md:my-4 md:p-4 p-2 ml-2 mr-3"
                            placeholder="  Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        {!recording ? <button
                            onClick={startRecording}
                            className="text-orange-500 rounded-3xl md:px-2 mr-2 py-2"
                        >
                            <img src="/mic.png" className="md:w-14 w-8" />
                        </button> :
                            <button
                                onClick={stopRecording}
                                className="text-orange-500 border-2 border-orange-600 rounded-3xl md:px-2 mr-2 py-2 opacity-25"
                            >
                                <img src="/mic.png" className="md:w-14 w-8" />
                            </button>}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isDisabled}
                            className="text-orange-500 rounded-3xl md:px-2 py-2 disabled:opacity-25"
                        >
                            <img src="/send.png" className="md:w-14 w-8" />
                        </button>
                    </div>
                </div>
                <div className="md:hidden absolute bottom-0 left-0 z-50 w-full h-12 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
                        <button type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                            {/* <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Latest</span> */}
                        </button>
                        <button type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                            </svg>
                            {/* <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Following</span> */}
                        </button>
                        <button type="button" className="inline-flex flex-col items-center justify-center font-medium px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                            </svg>
                            {/* <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Favorites</span> */}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
