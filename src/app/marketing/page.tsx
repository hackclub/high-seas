import "./index.css";

// import SignIn from "@/components/sign_in";
// import HighSeas from "/public/logo.png";
// import BackgroundImage from "/public/bg.png";
import Image from "next/image";
import SignIn from "@/components/sign_in";

import orphwoah from "./art/orphwoah.png";

import how1 from "./art/how1.png";
import how2 from "./art/how2.png";
import how3 from "./art/how3.png";
import divider from "./art/divider.png";
import divider2 from "./art/divider2.png";
// import paper from "./art/paper.png";

import shop1 from "./art/shop/shop1.png";
import shop2 from "./art/shop/shop2.png";
import shop3 from "./art/shop/shop3.png";
import shop4 from "./art/shop/shop4.png";
import shop5 from "./art/shop/shop5.png";
import shop6 from "./art/shop/shop6.png";
import { getSession } from "../utils/auth";

export default async function Marketing() {
  const session = await getSession();

  return (
    <div>
      <div className="relative h-screen">
        <img
          src="/background.svg"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-screen flex items-center justify-center">
          <div className="flex flex-col justify-center items-center text-center">
            <div className=" flex flex-col justify-center items-center mb-24">
              <img
                src="/highlogo.svg"
                alt="high seas logo"
                className="xl:max-w-3xl md:max-w-xl max-w-sm"
              />
              <p className="text-2xl md:text-4xl text-white mx-16">
                Build personal projects. Get free stuff.
              </p>
              <div className="flex flex-wrap text-xl md:text-xl mt-6 justify-center items-center mx-4 rounded-xl border-[#3852CD] border-4 bg-[#3852CD]">
              <input
                type="text"
                placeholder="name@email.com"
                className="px-4 py-2 rounded-lg text-md"
              />
              <button className="bg-[#3852CD] px-4 py-2 text-white text-sm md:text-xl ">Get started + get free stickers →</button>
            </div>
            </div>
            <a href="#howthisworks">
              <img
                src="/arrows.svg"
                className="w-16 h-16 mb-6 opacity-60 bobble"
              />
            </a>

            <div className="text-[#214495]">
              <p className="text-lg mx-10">
                In High Seas, code projects and get free hardware like Raspberry
                Pis, 3D Printers, and iPads.
              </p>
              <p className="text-lg mb-10 mx-10">
                By <a href="https://hackclub.com" target="blank" rel="noopenner noreferrer" className="underline">Hack Club</a> and <a href="https://github.com/" target="blank" rel="noopenner noreferrer" className="underline">GitHub</a>. For teens. Starts October 30. Ends
                January 31.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="watergradient">
        <div className="flex flex-col justify-center items-center">
          <div className="bg-blue-700 w-[200px] xl:w-[1200px] h-1"></div>
        </div>

        <div className="py-24" id="howthisworks">
          <div className="flex justify-center items-center mb-6">
            <p className="text-5xl text-center">How this works:</p>
          </div>

          <div className="flex flex-col justify-center items-center text-white mx-8">
            <div className="flex flex-wrap m-0 p-6 rounded-md">
              <div className="flex flex-col justify-center items-center mb-8 xl:mb-0 xl:mr-8 w-full xl:w-auto text-center p-8 xl:px-16 xl:py-10 rounded-md relative pop">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md z-0"
                />
                <div className="relative">
                  <p className="text-3xl">Make cool projects!</p>
                  <div className="flex flex-col justify-center items-center my-2">
                    <img
                      src="/divider.svg"
                      alt="divider"
                      className="opacity-40 h-3 w-auto object-contain"
                    />
                  </div>
                  <p className="text-xl max-w-[600px]">
                    Download the High Seas extension for your code editor, and
                    hack on something cool! Examples: making your own PCB,
                    building a personal website, or creating a video game.
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center w-full xl:w-auto bobble opacity-90">
                <Image
                  src="/ship.svg"
                  alt="dragons battling"
                  width={400}
                  height={400}
                />
              </div>
            </div>

            <div className="flex flex-wrap m-0 p-6 rounded-md">
              <div className="flex justify-center items-center w-full md:w-auto">
                <Image
                  src="/hydra.svg"
                  alt="dragons battling"
                  width={400}
                  height={400}
                  className="left-0 absolute bobble opacity-95"
                />
                <Image
                  src="/howtobacks.svg"
                  alt="dragons battling"
                  width={400}
                  height={400}
                  className="opacity-0"
                />
              </div>
              <div className="flex flex-col justify-center items-center mb-8 xl:mb-0 xl:mr-8 w-full xl:w-auto text-center p-8 xl:px-16 xl:py-10 rounded-md relative pop">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md z-0"
                />
                <div className="relative">
                  <p className="text-3xl mb-4">
                    Submit your projects for Doubloons!
                  </p>
                  <div className="flex flex-col justify-center items-center my-2">
                    <img
                      src="/divider.svg"
                      alt="divider"
                      className="opacity-40 h-3 w-auto object-contain"
                    />
                  </div>
                  <p className="text-xl max-w-[600px]">
                    Share your projects with our community of teen makers. Sign
                    in with Hack Club Slack and ship them in the Harbour! For
                    each hour coded, earn Doubloons (our virtual currency).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap m-0 p-6 rounded-md">
              <div className="flex flex-col justify-center items-center mb-8 xl:mb-0 xl:mr-8 w-full xl:w-auto text-center p-8 xl:px-16 xl:py-10 rounded-md relative pop">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md z-0"
                />
                <div className="relative">
                  <p className="text-3xl mb-4">
                    Spend Doubloons on awesome prizes!
                  </p>
                  <div className="flex flex-col justify-center items-center my-2">
                    <img
                      src="/divider.svg"
                      alt="divider"
                      className="opacity-40 h-3 w-auto object-contain"
                    />
                  </div>
                  <p className="text-xl max-w-[600px]">
                    Use Doubloons to purchase loot for your next project! Items
                    range from soldering irons to 3D printers. In just 5 hours,
                    you could earn a Raspberry Pi Zero! Full prize list below.
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center w-full xl:w-auto bobble">
                <Image
                  src="/chest.svg"
                  alt="treasure chest"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>

          <div className="my-24">
            <div className="flex justify-center items-center mb-5">
              <p className="text-5xl text-center mt-12">
                Last time we did this...
              </p>
            </div>
            <div className="mx-5 md:mx-44">
              <div className="flex flex-wrap justify-center items-stretch">
                {/*<div className="bg-blue-500 p-8 rounded-lg m-2 max-w-xl pop">
                <p className="mb-2 text-2xl">Hack Club is an open-source non-profit helping teens get into coding and making</p>
                <p className="">And we've partnered with GitHub again to run High Seas! This summer, we ran Arcade, another program where you make stuff and get stuff. Here are some stats:</p>
              </div>*/}

                <div className="relative p-8 rounded-lg m-2 max-w-xl pop flex-1 flex flex-col justify-center">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative text-center">
                    <p className="text-7xl mb-2">4,000+</p>
                    <p className="text-xl">high schoolers participated</p>
                  </div>
                </div>

                <div className="relative p-8 rounded-lg m-2 max-w-xl pop flex-1 flex flex-col justify-center">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative text-center">
                    <p className="text-7xl mb-2">130,00+</p>
                    <p className="text-2xl">total hours logged</p>
                  </div>
                </div>

                <div className="relative p-8 rounded-lg m-2 max-w-xl pop flex-1 flex flex-col justify-center">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative text-center">
                    <p className="text-7xl mb-2">11,111+</p>
                    <p className="text-xl">
                      total prizes shipped to 119 countries
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 m-2 justify-center items-center">
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>{"That's including:"}</p>
                  </div>
                </div>
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>348 Raspberry Pi Zeros</p>
                  </div>
                </div>
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>150 Wacom Intuos</p>
                  </div>
                </div>
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>120 iPads</p>
                  </div>
                </div>
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>64 3D Printers</p>
                  </div>
                </div>
                <div className="relative overflow-hidden p-2 px-6 rounded-xl text-xl pop">
                  <img
                    src="/howtobacks.svg"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="relative">
                    <p>and more!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-12">
            <div className="flex flex-col justify-center items-center mb-8 m-5">
              <p className="text-5xl text-center mb-2">
                {"Prizes to power up your next project!"}
              </p>
              <p className="text-xl text-center">
                Redeem these with your Doubloons! For high schoolers (or
                younger) only.
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center xl:mx-44 2xl:mx-56">
              <Prizes />
            </div>
            <div className="flex flex-col justify-center items-center mt-8 m-10">
              {/*<div className="bg-blue-500 rounded-md p-4 px-16 pop mb-2">
              <p className="text-3xl text-center">
                Get the full list of items when you sign in!
              </p>
            </div>*/}
              <p className="text-xl text-center mx-5 mb-5">
                This is just a sneak peak... new items will be added over the
                winter!
              </p>
            </div>
          </div>

          <div className="my-24">
            <div className="flex justify-center items-center mb-8 m-5">
              <p className="text-5xl text-center mx-4">
                Check out what others are building!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8 mx-8 lg:mx-24 2xl:mx-64 mt-10">
              <div className="border-4 border-dashed border-white border-opacity-50 rounded-lg md:col-span-6 pop p-2">
                <iframe
                  src="https://high-seas-map.vercel.app/"
                  className="w-full h-96 rounded-lg"
                  title="High Seas Map"
                ></iframe>
                <p className="flex flex-col justify-center text-center mt-2">
                  Drag around this map and click on the ships!
                </p>
              </div>

              {/* <div className="bg-blue-500 p-8 rounded-lg md:col-span-6 pop">
                <p>insert sam's map here</p>
                }
                <p className="text-3xl">Build whatever you want!</p>
                <p className="my-4 text-lg">
                  Any technical project counts. You could build an AR game,
                  pixel art display, drawing robot, and more! After you{"'"}re
                  done your project, submit it to The Keep! Your project will
                  compete against other similar-timed projects and you{"'"}ll
                  earn Scales based on how well you do.
                </p>

              </div>*/}

              <div className="relative p-8 rounded-lg pop md:col-span-4 overflow-hidden">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="relative mx-5 md:my-5 md:mx-0">
                  <p className="text-2xl">{"Don't know where to start?"}</p>
                  <p className="text-lg mt-2">
                    Try out one of these Hack Club programs!
                  </p>
                  <ul className="mt-4 mb-2 text-lg list-disc ml-8">
                    <li>
                      <a
                        href="https://boba.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Boba drops
                      </a>
                      : Build a site, get boba!
                    </li>
                    <li>
                      <a
                        href="https://fraps.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Hackaccino
                      </a>
                      : Ship a 3D website, get a free Frappuccino!
                    </li>
                    <li>
                      <a
                        href="https://cider.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Cider
                      </a>
                      : Develop an iOS app, we&apos;ll cover the $100 AppStore
                      fee.
                    </li>
                  </ul>
                  <p className="text-xl">
                    More workshops{" "}
                    <a
                      href="https://jams.hackclub.com/"
                      target="_blank"
                      rel="noopenner noreferrer"
                      className="aboutLink"
                    >
                      here
                    </a>
                    !
                  </p>
                </div>
              </div>
            </div>
          </div>

         
          <div>

          </div>

          

          <div className="bg-black bg-opacity-50 py-12 my-12">

          <div className="relative my-12">
            {/*<div className="absolute inset-0 bg-black opacity-50 z-10"></div>
            <div className="images-ani relative z-0">
              <div className="images-slide">
                <img src="/pictures/pic1.png" alt="picture" className="" />
                <img src="/pictures/pic2.png" alt="picture" className="" />
                <img src="/pictures/pic3.png" alt="picture" className="" />
                <img src="/pictures/pic4.png" alt="picture" className="" />
              </div>
              <div className="images-slide">
                <img src="/pictures/pic1.png" alt="picture" className="" />
                <img src="/pictures/pic2.png" alt="picture" className="" />
                <img src="/pictures/pic3.png" alt="picture" className="" />
                <img src="/pictures/pic4.png" alt="picture" className="" />
              </div>
            </div>*/}


            <div className="flex flex-col justify-center text-center">
              <p className="text-5xl mt-12 mx-5 text-white">Join a community of makers</p>
            </div>

            
          </div>




            <div className="">

              <div className="flex flex-wrap justify-center items-center gap-10">
                <img src="/pictures/pic4.png" alt="hack clubbers!" className="max-w-96"/>
                <iframe width="640" height="360"
                  src="https://www.youtube.com/embed/hiG3fYq3xUU">
                </iframe>
              </div>

              <div className="flex flex-wrap justify-center items-center mb-12 gap-6 mx-5 my-12">
                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="/howtobacks.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://scrapbook.hackclub.com/_next/image?url=https%3A%2F%2Favatars.slack-edge.com%2F2024-05-06%2F7077145829972_8597fe575e09a698859c_192.png&w=48&q=75"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @elijah
                      </p>
                    </div>
                    <p className="text-sm mb-4">
                      Finally shipped my personal ai clone and had a ton of fun
                      playing around with it and seeing what other people did with
                      it! Personal favorite was when it threatened to kill me and
                      got very unhinged when the person threatened to send
                      screenshots to me
                    </p>
                    <img src="https://scrapbook-into-the-redwoods.s3.amazonaws.com/4d4ecc40-c388-4b9d-997f-1f3d6a21302c-image.png" />
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="howtobacks.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://scrapbook.hackclub.com/_next/image?url=https%3A%2F%2Favatars.slack-edge.com%2F2023-04-15%2F5116546887938_afb907f96fa13e434a49_192.png&w=48&q=75"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @cupcakes
                      </p>
                    </div>
                    <p className="text-sm mb-4">Assembling blot robot! 🪛 </p>
                    <img
                      src="https://scrapbook-into-the-redwoods.s3.amazonaws.com/e75cf24a-46d9-45fa-92d3-b9e5862d0d47-img_2442.jpg"
                      className="w-56"
                    />
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="/howtobacks.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://scrapbook.hackclub.com/_next/image?url=https://secure.gravatar.com/avatar/c2e358d7bf4677cac086556035ce1dbc.jpg?s%3D192%26d%3Dhttps%253A%252F%252Fa.slack-edge.com%252Fdf10d%252Fimg%252Favatars%252Fava_0011-192.png&w=640&q=75"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @KonstantinosFragkoulis
                      </p>
                    </div>
                    <p className="text-sm mb-4">
                      Well, the drone now should be able to follow the biggest
                      object that it sees with a specific color. I {"haven't"}{" "}
                      tested it yet though 😞 ({"I'm"} too scared to crash it).
                      Here is a clip from earlier today, my genuine reaction to
                      the first takeoff ever (got a bit scared at the end) 👍{" "}
                    </p>
                    <img src="https://cloud-fshng6w8x-hack-club-bot.vercel.app/0videoframe_809.png" />
                  </div>
                </div>
              </div>

              <div className="my-12 mt-20">
                <div className="flex flex-col justify-center text-center items-center">
                  <div className="flex flex-row gap-4">
                    <div className="bg-blue-500 rounded-3xl p-2 max-w-2xl pop">
                      <a
                        href="https://scrapbook.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="text-2xl mx-4"
                      >
                        See more projects →
                      </a>
                    </div>
                    {/*<div className="bg-blue-500 rounded-3xl p-2 max-w-2xl">
                      <a href="#" className="text-2xl mx-4">Join the Hack Club Slack →</a>
                    </div>*/}
                  </div>
                </div>
              </div>
            </div>



          </div>
        </div>

        <div className="">
          <div className="flex justify-center items-center mb-5">
            <p className="text-5xl text-center mt-12">FAQ</p>
          </div>
          <div>
            <Faq />
          </div>
        </div>
      </div>

      <div className="relative h-screen">
        <img
          src="/footerbkgr.svg"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-screen flex items-center justify-center">
          <div className="flex flex-col justify-center items-center text-center">
            <div className=" flex flex-col justify-center items-center">
              <p className="text-4xl text-white">
                Build. Battle. Booty. Repeat.
              </p>
              <div className="flex flex-wrap md:gap-4 gap-2 text-xl md:text-3xl justify-center items-center mx-4">
                <div className="flex flex-wrap text-xl md:text-xl mt-6 justify-center items-center mx-4 rounded-xl border-[#3852CD] border-4 bg-[#3852CD]">
                  <input
                    type="text"
                    placeholder="name@email.com"
                    className="p-4 rounded-lg text-md"
                  />
                  <button className="bg-[#3852CD] p-4  text-white text-2xl">Get started + get free stickers →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F567D7] p-8">
        <div className="xl:mx-44 md:mx-22 mt-4">
          <p className="mb-4 text-lg text-pink-950">
            A project by{" "}
            <a
              href="https://hackclub.com/"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              Hack Club
            </a>
            .
          </p>
          <p className="max-w-2xl text-pink-800 text-sm">
            Hack Club is a registered 501(c)3 nonprofit organization that
            supports a network of 20k+ technical high schoolers. We believe you
            learn best by building so we{"'"}re creating community and providing
            grants so you can make. In the past few years, we{"'"}ve{" "}
            <a
              href="https://hackclub.com/arcade/"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              partnered with GitHub to run Arcade
            </a>
            ,{" "}
            <a
              href="https://github.com/hackclub/the-hacker-zephyr"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              {"hosted the world's longest hackathon on land"}
            </a>
            , and{" "}
            <a
              href="https://www.youtube.com/watch?v=QvCoISXfcE8"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              {"ran Canada's largest high school hackathon"}
            </a>
            .
          </p>
        </div>

        <div className="xl:mx-44 md:mx-22 mt-8">
          <div className="flex flex-wrap gap-x-24 gap-y-8">
            <div className="flex flex-col">
              <p className="mb-2 text-pink-800 text-xl">Hack Club</p>
              <div className="text-pink-700">
                <a href="https://hackclub.com/philosophy/">Philosophy</a>
                <br />
                <a href="https://hackclub.com/team/">Our Team & Board</a>
                <br />
                <a href="https://hackclub.com/jobs/">Jobs</a>
                <br />
                <a href="https://hackclub.com/brand/">Branding</a>
                <br />
                <a href="https://hackclub.com/press/">Press Inquiries</a>
                <br />
                <a href="https://hackclub.com/philanthropy/">Donate</a>
              </div>
            </div>

            <div className="flex flex-col">
              <p className="mb-2 text-pink-800 text-xl">Resources</p>
              <div className="text-pink-700">
                <a href="https://events.hackclub.com/">Community Events</a>
                <br />
                <a href="https://jams.hackclub.com/">Jams</a>
                <br />
                <a href="https://workshops.hackclub.com/">Workshops</a>
                <br />
                <a href="https://toolbox.hackclub.com/">Toolbox</a>
                <br />
                <a href="https://directory.hackclub.com/">Clubs Directory</a>
                <br />
                <a href="https://hackclub.com/conduct/">Code of Conduct</a>
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>

      <img
        src="/footerbelow.svg"
        alt="under footer image"
        className="w-full h-full object-cover"
      />

      {/*}

        <div className="bg-blue-500 p-8">
          <div className="xl:mx-44 md:mx-22 my-4">
            <p className="mb-4 text-xl">
              A project by{" "}
              <a
                href="https://hackclub.com/"
                target="_blank"
                rel="noopenner noreferrer"
                className="footLink"
              >
                Hack Club
              </a>
              .
            </p>
            <p className="max-w-3xl">
              Hack Club is a registered 501(c)3 nonprofit organization that
              supports a network of 20k+ technical high schoolers. We believe
              you learn best by building so we{"'"}re creating community and
              providing grants so you can make. In the past few years, we{"'"}ve{" "}
              <a
                href="https://hackclub.com/arcade/"
                target="_blank"
                rel="noopenner noreferrer"
                className="footLink"
              >
                partnered with GitHub to run Arcade
              </a>
              ,{" "}
              <a
                href="https://github.com/hackclub/the-hacker-zephyr"
                target="_blank"
                rel="noopenner noreferrer"
                className="footLink"
              >
                {"hosted the world's longest hackathon on land"}
              </a>
              , and{" "}
              <a
                href="https://www.youtube.com/watch?v=QvCoISXfcE8"
                target="_blank"
                rel="noopenner noreferrer"
                className="footLink"
              >
                {"ran Canada's largest high school hackathon"}
              </a>
              .
            </p>
          </div>
        </div> */}

      {/*<div className="w-full h-full max-w-prose mx-auto">
      <Image
        className="-z-10 fixed inset-0 w-full h-full object-cover"
        src={BackgroundImage}
        alt=""
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
      <header className="w-fit mx-auto flex flex-col items-center gap-4">
        <Image
          src={HighSeas}
          alt="low skies"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
        <h1 className="text-white text-2xl">Welcome to Low Skies</h1>
      </header>

      <SignIn />

      <div className="text-white">
        <p>This is the signed out marketing page</p>
        <br />
        <p>
          Body body body body body body body body body body body body body body
          body body body body body body body body body body body body body body
          body body body body body body body body body body body body body body
          body body body body body body body body body body body body body body
          body body body body body body body body body body body body body body
          body body body body body body body body body body body body body body
          body
        </p>
      </div>
    </div> */}
    </div>
  );
}

interface FaqCardProps {
  question: string;
  answer: string;
}

const FaqCard: React.FC<FaqCardProps> = ({ question, answer }) => {
  return (
    <div>
      <div className="relative p-8 rounded-lg my-2 max-w-xl pop">
        <img
          src="/faqbkgr.svg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative">
          <p className="mb-2 text-2xl">{question}</p>
          <p className="" dangerouslySetInnerHTML={{ __html: answer }}></p>
        </div>
      </div>
    </div>
  );
};

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Who is eligible?",
    answer: `You need to be a high schooler (or younger). You just need a <a href="https://waka.hackclub.com/" target="_blank" ref="noopenner noreferrer" class="faqLink">Hackatime</a> account to participate. Different prizes have different country restrictions. Sign in with Hack Club Slack to get started!`,
  },
  {
    question: "How much does it cost?",
    answer: `100% free – all the prizes are donated to us or paid for by us! Some shipments may have customs charges that we can't cover depending on your country.`,
  },
  {
    question: "What types of projects count?",
    answer: `Projects need to be open source (ie. linked to a GitHub repo) & have a way for people to experience it (ie. a game, a website, etc).`,
  },
  {
    question: "How many projects can I build?",
    answer: `You can submit as many projects as you make. We count them after they've been finished!`,
  },
  {
    question: "I need help!",
    answer: `Contact us! Reach out in <a href="https://hackclub.slack.com/archives/C07PZNMBPBN" target="_blank" ref="noopenner noreferrer" class="faqLink">#low-skies-help</a> channel of the Hack Club Slack. We're always ready to answer all your questions!`,
  },
  {
    question: "Does a team project count?",
    answer: `Not for this event! You must only enter projects that were built by yourself.`,
  },
  {
    question: "What about school work or a job?",
    answer: `Low Skies is about the joy of building for the sake of building. It must be a personal project! If you're building something for school or work, we can't count it.`,
  },
  {
    question: "Is this legit?",
    answer: `Yup! This summer, we ran <a class="faqLink" href="https://hackclub.com/arcade/">Arcade</a>, a program that gave out similar prizes for free. We have also run multiple hackathons, including one on a <a class="faqLink" href="https://www.youtube.com/watch?v=hiG3fYq3xUU">moving train across Canada</a> this summer!`,
  },
];

const Faq: React.FC = () => {
  return (
    <div className="p-5 flex flex-wrap justify-center items-center">
      {faqData.map((item, index) => (
        <FaqCard key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

const Prize = () => {
  return (
    <div className="relative overflow-hidden p-6 rounded-lg m-4 pop border-2 border-dashed border-white">
      <img
        src="/howtobacks.svg"
        alt="card backs"
        className="absolute w-full h-full inset-0 object-cover opacity-80"
      />
      <div className="relative my-2">
        <p className="flex justify-center text-center text-3xl">
          Pile of Stickers
        </p>
        <img
          src="/divider.svg"
          className="w-full object-cover absolute mt-2 opacity-60"
        />
        <p className="mt-4 text-xl text-center">510 Doubloons</p>
        <img
          src="/divider.svg"
          className="w-full object-cover absolute opacity-60"
        />
        <div className="w-64 h-64 my-4 rounded-sm flex flex-col justify-center items-center">
          <Image src={shop1} alt="Shop item" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

interface PrizeProps {
  name: string;
  doubloons: number;
  image: string;
}

const PrizeCard: React.FC<PrizeProps> = ({ name, doubloons, image }) => {
  return (
    <div className="relative overflow-hidden p-6 rounded-lg m-4 pop">
      <img
        src="/howtobacks.svg"
        alt="card backs"
        className="absolute w-full h-full inset-0 object-cover opacity-80"
      />
      <div className="relative my-2">
        <p className="flex justify-center text-center text-3xl">{name}</p>
        <img
          src="/divider.svg"
          className="w-full object-cover absolute mt-2 opacity-60"
        />
        <p className="mt-4 text-xl text-center">{doubloons} doubloons</p>
        <img
          src="/divider.svg"
          className="w-full object-cover absolute opacity-60"
        />
        <div className="w-64 h-64 my-4 rounded-sm flex flex-col justify-center items-center">
          <Image
            src={image}
            alt="Shop item"
            className="w-full h-auto"
            width="500"
            height="500"
          />
        </div>
      </div>
    </div>
  );
};

interface PrizeItem {
  name: string;
  doubloons: string;
  image: string;
}

const PrizeData = [
  {
    name: "Micro SD Card",
    doubloons: 202,
    image: "https://cloud-6d9peiend-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "OpenAI credits",
    doubloons: 294,
    image: "https://cloud-i6i8qs7x0-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Bite Sized Linux",
    doubloons: 400,
    image: "https://cloud-8mlynfu76-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Domain",
    doubloons: 420,
    image: "https://cloud-bp5cbc3ab-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Raspberry Pi Zero",
    doubloons: 486,
    image: "https://cloud-a823iqif6-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Pinecil",
    doubloons: 876,
    image: "https://cloud-djbef06tx-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "iFixit Kit",
    doubloons: 883,
    image: "https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Hack Club Socks",
    doubloons: 1300,
    image: "https://cloud-5z0d3mpqk-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Blahåj",
    doubloons: 1312,
    image: "https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "Skeletool",
    doubloons: 1420,
    image: "https://cloud-ak5er2k0m-hack-club-bot.vercel.app/0image.png",
  },
  {
    name: "YubiKey",
    doubloons: 1512,
    image: "https://cloud-oc60fts8l-hack-club-bot.vercel.app/0image.png",
  },
];

const Prizes: React.FC = () => {
  return (
    <div className="p-5 flex flex-wrap justify-center items-center">
      {PrizeData.map((item, index) => (
        <PrizeCard
          key={index}
          name={item.name}
          doubloons={item.doubloons}
          image={item.image}
        />
      ))}
    </div>
  );
};
