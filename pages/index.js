import Link from 'next/link'
import React from 'react'

export default function index() {
    return (
        <div className="bg-gradient-to-t from-[#e69659] via-[#e39b63] to-white flex justify-center items-center h-screen">
            <img className="absolute top-0 left-0 my-5 mx-8 md:w-[100px] md:h-[100px] w-16 h-16" src="/unnamed.png" />
            <div className="text-center">
                <img alt="A friendly robot with headphones sitting on a book, representing a career companion" className="mx-auto md:my-5 md:w-[250px] md:h-[250px] w-40 h-40"src="/aibot.png" />
                <h1 className="text-lg mx-5 md:text-4xl md:mx-96 font-medium mb-5 text-white">
                    "Hello! Ready to Boost Your Career Journey with PGRKAM Career Companion?"
                </h1>
                <div className="md:space-x-20 md:flex md:justify-center md:mt-16 md:mb-10 mt-10">
                    <Link href={"/chat"} className="block bg-transparent border-2 border-white text-white font-semibold py-4 mb-3 px-5 md:px-40 rounded-full mx-10 md:mx-0 focus:outline-none hover:bg-orange-300 transition-colors">
                        English
                    </Link>
                    <Link href={"/chat/hindi"} className="block bg-transparent border-2 border-white text-white font-semibold py-4 md:px-40 px-5 mb-3 rounded-full mx-10 md:mx-0 focus:outline-none hover:bg-orange-300 transition-colors">
                        हिंदी
                    </Link>
                </div>
                <Link href={"/chat/punjabi"} className=" block md:flex md:mx-[550px] md:justify-center bg-transparent md:mt-5 mb-20 border-2 border-white text-white font-semibold py-4 md:px-40 px-5 mx-10  rounded-full focus:outline-none hover:bg-orange-300 transition-colors md:mb-3">
                    ਪੰਜਾਬੀ
                </Link>
            </div>
        </div>)
}
