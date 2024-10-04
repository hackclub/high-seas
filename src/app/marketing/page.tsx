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
      <div className="bodycss">
        <div className="landing items-center">
          <div className="landing-left container">
            <p className="text-6xl lg:text-8xl uppercase">Low Skies</p>
            <div className="my-4 lg:text-3xl xl:text-4xl text-lg">
              <p className="">{"A two week event by Hack Club"}</p>
              <p className="">Build stuff, battle others, get stuff!</p>
            </div>

            {/*<div className="bg-green-400 p-2 inline-block w-80 rounded-lg linkPop">
              <a
                className="text-2xl text-white ml-3"
                href="#"
                target="_blank"
                rel="noopenner noreferrer"
              >
                Enter the Thunderdome
              </a>
            </div>*/}
            <SignIn session={session} />
            <p className="mt-2 max-w-72 lg:max-w-xl">
              Low Skies is free for teens to participate in, running Oct 3-17!
            </p>
          </div>
          <div className="landing-right">
            <div className="bobble">
              <Image src={orphwoah} alt="orpheus" />
            </div>
          </div>
        </div>

        <Image
          src={divider}
          alt="Divider"
          className="mx-auto my-8 absolute xl:top-[77%] md:top-[85%] sm:top-[90%] top-[95%] w-full"
        />

        <div className="md:my-44 my-24 xl:pb-24 lg:pb-[50px]">
          <div className="flex justify-center items-center mb-6">
            <p className="text-5xl text-center">How this works:</p>
          </div>
          <div className="flex flex-col justify-center items-center text-blue-900 mx-8">
            <div className="flex flex-wrap bg-white m-2 p-8 rounded-md pop">
              <div className="flex justify-center items-center w-full md:w-auto">
                <Image src={how1} alt="knight thinking of ideas" />
              </div>
              <div className="flex flex-col justify-center items-center mt-8 md:mt-0 md:ml-8 w-full md:w-auto text-center">
                <p className="text-2xl mb-2">Make cool projects!</p>
                <p className="text-xl max-w-96">
                  Create personal projects and earn credit for your hours using{" "}
                  <a
                    href="https://waka.hackclub.com/"
                    target="_blank"
                    rel="noreferrer noopenner"
                    className="bg-green-400 px-2 rounded-lg"
                  >
                    Hackatime
                  </a>
                  !
                </p>
              </div>
            </div>

            <div className="flex flex-wrap bg-white m-2 p-8 rounded-md pop">
              <div className="flex flex-col justify-center items-center mb-8 md:mb-0 md:mr-8 w-full md:w-auto text-center">
                <p className="text-2xl mb-2">Battle against other projects!</p>
                <p className="text-xl max-w-96">
                  After finishing your project, submit it to{" "}
                  <span className="bg-green-400 px-2 rounded-lg">The Keep</span>
                  ! Your project will battle others in the{" "}
                  <span className="bg-green-400 px-2 rounded-lg">
                    Thunderdome
                  </span>
                  ; winners get <span>Scales</span>!
                </p>
              </div>
              <div className="flex justify-center items-center w-full md:w-auto">
                <Image src={how2} alt="dragons battling" />
              </div>
            </div>

            <div className="flex flex-wrap bg-white m-2 p-8 rounded-md pop">
              <div className="flex justify-center items-center w-full md:w-auto">
                <Image src={how3} alt="person shopping for items" />
              </div>
              <div className="flex flex-col justify-center items-center mt-8 md:mt-0 md:ml-8 w-full md:w-auto text-center">
                <p className="text-2xl mb-2">Get free tools and swag!</p>
                <p className="text-xl max-w-96">
                  At the{" "}
                  <span className="bg-green-400 px-2 rounded-lg">Shoppe</span>,{" "}
                  {"you'll"} be able to spend your{" "}
                  <span className="bg-green-400 px-2 rounded-lg">Scales</span>{" "}
                  on items of all sort, from Blahajs to Yubikeys!
                </p>
              </div>
            </div>
          </div>

          <div className="relative xl:top-[75%] md:top-[80%] top-[90%]">
            <Image
              src={divider}
              alt="Divider"
              className="mx-auto my-8 absolute w-full"
            />
          </div>
        </div>

        <div className="bg-[#46C1FE] pt-12 xl:pt-24 mt-12 md:my-44 my-24 lg:pb-44 xl:pb-56 pb-24 sm:pb-36">
          <div className="my-12 lg:mt-24">
            <div className="flex justify-center items-center mb-8">
              <p className="text-5xl text-center mx-4">
                One battle at a time, what will you make?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-8 lg:mx-24 2xl:mx-64 mt-10">
              <div className="bg-blue-500 p-8 rounded-lg md:col-span-2 pop">
                <p className="text-3xl">Build whatever you want!</p>
                <p className="my-4 text-lg">
                  Any technical project counts. You could build an AR game,
                  pixel art display, drawing robot, and more! After you{"'"}re
                  done your project, submit it to The Keep! Your project will
                  compete against other similar-timed projects and you{"'"}ll
                  earn Scales based on how well you do.
                </p>
                <p className="text-2xl">{"Don't know where to start?"}</p>
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
                    : Develop an iOS app, we&apos;ll cover the $100 AppStore fee.
                  </li>
                  <li>
                    Or, go though plenty of other workshops{" "}
                    <a
                      href="https://jams.hackclub.com/"
                      target="_blank"
                      rel="noopenner noreferrer"
                      className="aboutLink"
                    >
                      here
                    </a>
                    !
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500 p-8 rounded-lg pop">
                <p className="text-2xl">Not sure what to make?</p>
                <p className="text-lg my-4">
                  Here are some projects Hack Clubbers made over the summer:
                </p>
                <div className="mx-2">
                  <p className="mb-4">
                    Ajith (age 17) made a game where you can{" "}
                    <a
                      href="https://nalinplad.github.io/human-powered-computer/"
                      target="_blank"
                      rel="noopenner noreferrer"
                      className="buildLink"
                    >
                      play as a CPU
                    </a>
                    !
                  </p>
                  <p className="mb-4">
                    Brendan (age 17) built an entire{" "}
                    <a
                      href="https://github.com/AGB556/BISMUTH/tree/main"
                      target="_blank"
                      rel="noopenner noreferrer"
                      className="buildLink"
                    >
                      3D printer
                    </a>{" "}
                    from scratch!
                  </p>
                  <p>
                    Shreyas (age 15) made an{" "}
                    <a
                      href="https://github.com/deoshreyas/Circular-Audio-Visualiser"
                      target="blank"
                      rel="noopenner noreferrer"
                      className="buildLink"
                    >
                      Audio Visualizer
                    </a>
                    !
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-24">
            <div className="flex flex-col justify-center items-center mb-8 m-5">
              <p className="text-5xl text-center mb-2">{"What's in stock?"}</p>
              <p className="text-xl text-center">
                Redeem these with your Scales! For high schoolers (or younger)
                only.
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center xl:mx-44 2xl:mx-56">
              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop1}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  Pile of Stickers
                </p>
              </div>

              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop2}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  Yubikey
                </p>
              </div>

              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop3}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  Blahaj (friend)
                </p>
              </div>

              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop4}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  Raspberry Pi Zero
                </p>
              </div>

              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop5}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  Pinecil
                </p>
              </div>

              <div className="bg-blue-500 p-6 rounded-lg m-4 pop">
                <div className="bg-blue-400 w-64 h-72 mb-4 rounded-sm flex flex-col justify-center item-center">
                  <Image
                    src={shop6}
                    alt="Shop item"
                    className="w-full h-auto"
                  />
                </div>
                <p className="flex justify-center text-center text-3xl">
                  iFixit Kit
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center mt-8 m-10">
              <div className="bg-blue-500 rounded-lg p-4 pop">
                <p className="text-3xl text-center">
                  Get the full list of items when you sign in!
                </p>
              </div>
            </div>
          </div>

          <div className="relative xl:top-[75%] md:top-[80%] top-[90%]">
            <Image
              src={divider}
              alt="Divider"
              className="mx-auto my-8 absolute w-full"
            />
          </div>
        </div>

        <div className="my-24">
          <div className="flex justify-center items-center mb-5">
            <p className="text-5xl text-center mt-12">FAQ</p>
          </div>
          <div>
            <Faq />
          </div>
        </div>

        <Image src={divider2} alt="Divider" className="mx-auto my-8 w-full" />

        <div className="flex flex-col justify-center items-center mt-12 mb-24">
          <p className="text-xl mb-2">So, what are you waiting for?</p>
          <div className="">
            <SignIn session={session} />
          </div>
          {/*<button className="bg-green-400 p-4 text-4xl rounded-lg mx-8 linkPop">
            <a href="#">Enter the Thunderdome</a>
          </button>*/}
          <p className="text-xl mt-2">Build. Battle. Repeat.</p>
        </div>

        <div className="mb-24"></div>

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
        </div>
      </div>

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
      <div className="bg-blue-500 p-8 rounded-lg m-2 max-w-xl pop">
        <p className="mb-2 text-2xl">{question}</p>
        <p className="" dangerouslySetInnerHTML={{ __html: answer }}></p>
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
