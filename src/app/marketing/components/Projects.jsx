'use client'
const projectData = [
  {
    name: 'Waffle Chat',
    time: 20,
    description: `Waffle is a group chat app. It is end-to-end encrypted, uses
                firebase's secure protocols to ensure user data is safe, and
                uses google to sign in.`,
    doubloons: 1475,
    projectImagePath: '/dummyImage.png',
    Option: {
      src: 'https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png',
      name: 'Blahaj!',
    },
    otherOptions: {
      src: [
        'https://cloud-6d9peiend-hack-club-bot.vercel.app/0image.png',
        'https://cloud-i6i8qs7x0-hack-club-bot.vercel.app/0image.png',
        'https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png',
      ],
      name: ['SD Card', 'OpenAI Credits ', 'iFixit Kit'],
    },
  },
  {
    name: 'Waffle Chat',
    time: 20,
    description: `Waffle is a group chat app. It is end-to-end encrypted, uses
                firebase's secure protocols to ensure user data is safe, and
                uses google to sign in.`,
    doubloons: 1475,
    projectImagePath: '/image1.png',
    Option: {
      src: 'https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png',
      name: 'Blahaj!',
    },
    otherOptions: {
      src: [
        'https://cloud-6d9peiend-hack-club-bot.vercel.app/0image.png',
        'https://cloud-i6i8qs7x0-hack-club-bot.vercel.app/0image.png',
        'https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png',
      ],
      name: ['SD Card', 'OpenAI Credits ', 'iFixit Kit'],
    },
  },
  {
    name: 'Waffle Chat',
    time: 20,
    description: `Waffle is a group chat app. It is end-to-end encrypted, uses
                firebase's secure protocols to ensure user data is safe, and
                uses google to sign in.`,
    doubloons: 1475,
    projectImagePath: '/image1.png',
    Option: {
      src: 'https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png',
      name: 'Blahaj!',
    },
    otherOptions: {
      src: [
        'https://cloud-6d9peiend-hack-club-bot.vercel.app/0image.png',
        'https://cloud-i6i8qs7x0-hack-club-bot.vercel.app/0image.png',
        'https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png',
      ],
      name: ['SD Card', 'OpenAI Credits ', 'iFixit Kit'],
    },
  },
]

// import Image from 'next/image'

// export default function Projects() {
//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {projectData.map((project, index) => (
//         <div key={index} className="relative h-screen w-full overflow-hidden">
//           <Image
//             src="/footerbkgr.svg"
//             alt="Background pattern"
//             fill
//             className="absolute inset-0 object-cover"
//             priority
//           />

//           <div className="relative mx-auto mt-4 pl-20 max-w-full pt-8">
//             <h1 className="mb-6 text-5xl font-bold text-[#7efcde] text-left">
//               This app would get...
//             </h1>
//           </div>

//           <div className="relative mx-auto max-w-full px-4 lg:px-8">
//             <div className="grid grid-cols-1 lg:grid-cols-[45%_10%_45%] gap-4">
//               <div className="pl-6">
//                 <div className="relative w-full lg:w-[400px]">
//                   <Image
//                     src="/jagged-card-tall.svg"
//                     alt="Jagged card background"
//                     width={350}
//                     height={700}
//                     className="relative z-10"
//                   />
//                   <div className="absolute inset-x-4 top-8 z-20 max-w-[320px] text-white">
//                     <Image
//                       src={project.projectImagePath}
//                       alt="Chat screenshot"
//                       width={300}
//                       height={140} // sizes='100vw'
//                       className="h-full opacity-80 w-full mb-4 "
//                     />
//                     <h2 className="text-3xl ml-4 font-bold">{project.name}</h2>
//                     <div className="mt-2 w-[90%]  ml-4 h-[5px] rounded-full bg-cyan-100" />
//                     <p className="mt-4 text-lg ml-4 font-medium">
//                       {project.time} Hours Spent
//                     </p>
//                     <p className="mt-2 mr-16 ml-4 text-sm opacity-80">
//                       {project.description}
//                     </p>
//                   </div>
//                   <div className="absolute z-50 bottom-6 right-20 text-right">
//                     <p className="text-5xl text-[#ffe9e0]">
//                       {project.doubloons}
//                     </p>
//                     <p className="text-xl font-bold text-[#ffe9e0]">
//                       doubloons
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col items-start justify-center -ml-40">
//                 <Image
//                   src="/curly-arrow.svg"
//                   alt="Up arrow"
//                   width={100}
//                   height={75}
//                   className="mb-5"
//                 />
//                 <span className="text-5xl font-bold text-[#7efcde] my-1">
//                   or
//                 </span>
//                 <Image
//                   src="/curly-arrow.svg"
//                   alt="Down arrow"
//                   width={100}
//                   height={75}
//                   className="mt-4 rotate-180 scale-x-[-1]"
//                 />
//               </div>

//               <div className="-ml-40 -mt-10">
//                 <div className="text-center mb-2">
//                   <h2 className="mb-2  text-4xl font-bold text-[#7efcde] whitespace-nowrap">
//                     {project.Option.name}
//                   </h2>
//                   <div className="relative">
//                     <div className="absolute inset-0 mx-40 bg-white/30 blur-[40px]"> </div>
//                   <Image
//                     src={project.Option.src}
//                     alt={project.Option.name}
//                     width={350}
//                     height={400}
//                     className="mx-auto"
//                   />
//                   </div>
//                 </div>

//                 <div className="text-center mt-10 ">
//                   <h2 className="mb-2 text-3xl font-bold text-[#7efcde] whitespace-nowrap">
//                     {project.otherOptions.name.join(' + ')}
//                   </h2>
//                   <div className="flex justify-center">
//                     {project.otherOptions.src.map((src, idx) => (
//                       <div key={index} className="relative">
//                         <div className="absolute inset-0 bg-white/30 blur-[40px]"></div>
//                         <Image
//                           key={idx}
//                           src={src}
//                           alt={project.otherOptions.name[idx]}
//                           width={240}
//                           height={240}
//                           className="relative"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// 'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Projects() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative w-full overflow-hidden">
      {projectData.map((project, index) => (
        <div
          key={index}
          className="relative min-h-screen lg:h-screen w-full overflow-hidden"
        >
          <Image
            src="/footerbkgr.svg"
            alt="Background pattern"
            fill
            className="absolute inset-0 object-cover"
            priority
          />

          <div className="relative mx-auto mt-4 px-4 lg:pl-20 max-w-full pt-8">
            <h1 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#7efcde] text-center lg:text-left">
              This app would get...
            </h1>
          </div>

          <div className="relative mx-auto max-w-full px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[45%_10%_45%] gap-4">
              <div className="lg:pl-6">
                <div className="relative w-full max-w-[400px] mx-auto lg:mx-0">
                  <Image
                    src="/jagged-card-tall.svg"
                    alt="Jagged card background"
                    width={350}
                    height={700}
                    className="relative z-10 w-full h-auto"
                  />
                  <div className="absolute inset-x-4 top-8 z-20 max-w-[320px] text-white">
                    <Image
                      src={project.projectImagePath}
                      alt="Chat screenshot"
                      width={300}
                      height={140}
                      className="h-auto w-full mb-4 opacity-80"
                    />
                    <h2 className="text-2xl sm:text-3xl ml-4 font-bold">
                      {project.name}
                    </h2>
                    <div className="mt-2 w-[90%] ml-4 h-[5px] rounded-full bg-cyan-100" />
                    <p className="mt-4 text-base sm:text-lg ml-4 font-medium">
                      {project.time} Hours Spent
                    </p>
                    <p className="mt-2 mr-16 ml-4 text-sm opacity-80">
                      {project.description}
                    </p>
                  </div>
                  <div className="absolute z-50 bottom-6 right-6 sm:right-20 text-right">
                    <p className="text-4xl sm:text-5xl text-[#ffe9e0]">
                      {project.doubloons}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[#ffe9e0]">
                      doubloons
                    </p>
                  </div>
                </div>
              </div>

              {!isMobile && (
                <div className="hidden lg:flex flex-col items-start justify-center -ml-40">
                  <Image
                    src="/curly-arrow.svg"
                    alt="Up arrow"
                    width={100}
                    height={75}
                    className="mb-5"
                  />
                  <span className="text-5xl font-bold text-[#7efcde] my-1">
                    or
                  </span>
                  <Image
                    src="/curly-arrow.svg"
                    alt="Down arrow"
                    width={100}
                    height={75}
                    className="mt-4 rotate-180 scale-x-[-1]"
                  />
                </div>
              )}

              <div className="lg:-ml-40 lg:-mt-10">
                <div className="text-center mb-8 lg:mb-2">
                  <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-[#7efcde] whitespace-normal lg:whitespace-nowrap">
                    {project.Option.name}
                  </h2>
                  <div className="relative">
                    <div className="absolute inset-0 mx-auto lg:mx-40 bg-white/30 blur-[40px]"></div>
                    <Image
                      src={project.Option.src}
                      alt={project.Option.name}
                      width={350}
                      height={400}
                      className="mx-auto w-full max-w-[350px] h-auto"
                    />
                  </div>
                </div>

                <div className="text-center mt-8 lg:mt-10">
                  <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-[#7efcde] whitespace-normal lg:whitespace-nowrap">
                    {project.otherOptions.name.join(' + ')}
                  </h2>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    {project.otherOptions.src.map((src, idx) => (
                      <div key={idx} className="relative w-1/2 sm:w-auto">
                        <div className="absolute inset-0 bg-white/30 blur-[40px]"></div>
                        <Image
                          src={src}
                          alt={project.otherOptions.name[idx]}
                          width={240}
                          height={240}
                          className="relative w-full h-auto max-w-[240px] mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
