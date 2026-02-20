export default function About() {
    return (
        <main
            className="min-h-screen flex items-center justify-center px-6"
            style={{
                background:
                    "radial-gradient(circle at center, #000 30%, #3b3a3a 45%, #000 75%)",
            }}
        >
            <div
                className="max-w-3xl w-full bg-[#121216] 
                   border border-[#C6A75E]/20 
                   rounded-3xl p-12 
                   text-white 
                   shadow-[0_0_40px_rgba(198,167,94,0.08)]"
            >
                <h1 className="text-4xl font-light tracking-tight mb-6">
                    About <span className="text-[#C6A75E]">Me</span>
                </h1>

                <p className="text-zinc-400 leading-relaxed mb-6">
                    I am a Bachelor’s degree graduate and a graduate of a technical program in Computer Science. I am a strong advocate of vibe coding — building with creativity, intuition, and flow while maintaining technical precision.

                    I have a deep passion for software development, cybersecurity, networking, and everything related to information technology. I’m constantly exploring new technologies, refining my skills, and pushing myself to grow within the IT field.
                </p>

                <p className="text-zinc-400 leading-relaxed">
                    - GabsterCooler
                </p>
            </div>
        </main>
    );
}