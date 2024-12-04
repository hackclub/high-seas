import './index.css'

import Image from 'next/image'
import Link from 'next/link'

import { IdeaGenerator } from '../../components/idea-generator.js'

import shop1 from './art/shop/shop1.png'
import { getSession } from '../utils/auth'

import EmailSubmissionForm from './components/email-submission-form'
import ScrollShop from './components/ScrollShop.jsx'
import ScrollShopReverse from './components/ScrollShopReverse.jsx'

export default async function Marketing() {
  const session = await getSession()

  return (
    <div>
      <div className="relative h-screen">
        <img
          src="/background.svg"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative h-screen flex items-center justify-center">
          <div className="flex flex-col justify-center items-center text-center mt-20 xl:mt-10">
            <div className=" flex flex-col justify-center items-center mb-10 lg:mb-20">
              <img
                src="/highlogo.svg"
                alt="high seas logo"
                className="xl:max-w-xl md:max-w-lg sm:max-w-sm max-w-xs"
              />
              <p className="text-3xl sm:text-3xl md:text-4xl text-white mx-2 drop-shadow-lg">
                Build personal projects.<br className="inline sm:hidden"></br>{' '}
                Get free stuff.
              </p>
              <div className="flex flex-wrap text-xl md:text-xl mt-6 justify-center items-center mx-4 rounded-xl ">
                {session ? (
                  <a
                    href="/signpost"
                    className="p-4 rounded-lg text-md text-white bg-[#3852CD]"
                  >
                    <img
                      src="/signpost.png"
                      width={32}
                      className="inline-block mr-4"
                    />
                    Enter the harbor
                  </a>
                ) : (
                  <EmailSubmissionForm />
                )}
              </div>
              <p
                className="mt-4 text-white bg-opacity-50 px-4 py-2 rounded-lg"
                style={{
                  backgroundImage: 'url(/floorboard.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 1)',
                  mixBlendMode: 'hard-light',
                  transform: 'rotate(-2deg)',
                }}
              >
                Free stickers for all new recruits!
              </p>
            </div>
            <Link href="#howthisworks">
              <img
                src="/arrows.svg"
                className="w-16 h-14 mb-6 opacity-60 bobble"
              />
            </Link>

            <div className="text-[#214495]">
              <p className="text-md md:text-lg lg:text-lg mb-10 mx-2">
                By{' '}
                <Link
                  href="https://hackclub.com"
                  target="blank"
                  rel="noopenner noreferrer"
                  className="underline"
                >
                  Hack Club
                </Link>{' '}
                and{' '}
                <Link
                  href="https://github.com/"
                  target="blank"
                  rel="noopenner noreferrer"
                  className="underline"
                >
                  GitHub
                </Link>
                .<br className="inline lg:hidden"></br> For teenagers 18 and
                under.<br className="inline lg:hidden"></br> October 30th to
                January 31st.
              </p>
            </div>

            <div className="flex flex-col justify-center items-center my-3">
              <img src="/divider.svg" className="w-full mx-5 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="watergradient">
        <div className="py-24 pt-12" id="howthisworks">
          <div className="flex justify-center items-center mb-6">
            <p className="text-4xl sm:text-5xl text-center">How this works:</p>
          </div>

          <div className="flex flex-col justify-center items-center text-white mx-8">
            <div className="flex flex-wrap m-0 p-0 xl:p-6 rounded-md">
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
                    hack on something cool! Examples: building a personal
                    website, making an app, or creating a video game.
                  </p>
                </div>
              </div>
              <div className="hidden xl:flex justify-center items-center w-full xl:w-auto bobble opacity-90">
                <Image
                  src="/ship.svg"
                  alt="dragons battling"
                  width={400}
                  height={400}
                />
              </div>
            </div>

            <div className="flex flex-wrap m-0 p-0 xl:p-6 rounded-md">
              <div className="hidden xl:flex justify-center items-center w-full md:w-auto">
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
                  className="opacity-0 h-1 xl:h-auto"
                />
              </div>
              <div className="flex flex-col justify-center items-center mb-8 xl:mb-0 xl:mr-8 w-full xl:w-auto text-center p-8 xl:px-16 xl:py-10 rounded-md relative pop">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md z-0 opacity-75"
                />
                <div className="relative">
                  <p className="text-3xl mb-4">
                    Submit your projects for{' '}
                    <span className="inline-flex items-center align-middle">
                      <img src="/doubloon.svg" className="w-8 h-8 mx-1" />
                    </span>
                    Doubloons!
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
                    in with Hack Club Slack and ship them in the Harbor! For
                    each hour coded, earn{' '}
                    <span className="inline-flex items-center align-middle">
                      <img src="/doubloon.svg" className="w-6 h-6 mx-1" />
                    </span>
                    Doubloons (our virtual currency).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row flex-wrap m-0 p-0 xl:p-6 rounded-md">
              <div className="flex flex-col justify-center items-center mb-8 xl:mb-0 xl:mr-8 w-full xl:w-auto text-center p-8 xl:px-16 xl:py-10 rounded-md relative pop">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md z-0 opacity-50"
                />
                <div className="relative">
                  <p className="text-3xl mb-4">
                    Spend{' '}
                    <span className="inline-flex items-center align-middle">
                      <img src="/doubloon.svg" className="w-8 h-8 mx-1" />
                    </span>
                    Doubloons on awesome prizes!
                  </p>
                  <div className="flex flex-col justify-center items-center my-2">
                    <img
                      src="/divider.svg"
                      alt="divider"
                      className="opacity-40 h-3 w-auto object-contain"
                    />
                  </div>
                  <p className="text-xl max-w-[600px]">
                    Use{' '}
                    <span className="inline-flex items-center align-middle">
                      <img src="/doubloon.svg" className="w-6 h-6 mx-1" />
                    </span>
                    Doubloons to purchase loot for your next project! Items
                    range from soldering irons to 3D printers. In just 5 hours,
                    you could earn a Raspberry Pi Zero! Full prize list below.
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center w-full xl:w-auto bobble">
                <Image
                  src="/chest.png"
                  alt="treasure chest"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>

          <div className="mb-8 mt-24">
            <ScrollShop />
          </div>

          <div className="mb-24">
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
                    <p className="text-7xl mb-2">5,000</p>
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
                    <p className="text-7xl mb-2">130,000+</p>
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
                    <p className="text-7xl mb-2">11,112</p>
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
          <div className="mb-20 mt-24">
            <ScrollShopReverse />
          </div>

          <div className="my-12">
            <div className="flex flex-col justify-center items-center mb-8 m-5">
              <p className="text-5xl text-center mb-4 leading-[1.2]">
                Prizes to{' '}
                <span
                  className="pb-2 px-4 rounded-md whitespace-nowrap"
                  style={{
                    backgroundImage: 'url(/floorboard.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  power up
                </span>{' '}
                your next project!
              </p>
              <div className="flex flex-row justify-center">
                <p className="text-xl text-center">
                  Redeem these with your{' '}
                  <span className="inline-flex items-center align-middle">
                    <img src="/doubloon.svg" className="w-6 h-6 mx-1" />
                  </span>
                  Doubloons! For high schoolers (or younger) only.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center items-center">
              <Prizes />
            </div>
            <div className="flex flex-col justify-center items-center mt-0 md:mt-8 mx-4">
              <h3 className="text-3xl md:text-4xl mb-2">
                ✨ Special Prizes ✨
              </h3>
              <p className="text-sm md:text-lg text-center">
                We'll pick a winner for each of these at the end,
                <br className="inline lg:hidden"></br> so get cracking now on
                something extra-awesome!
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center mt-4 m-10">
              <div className="relative p-6 px-4 rounded-lg m-4 pop">
                <img
                  src="/shopback.svg"
                  alt="card backs"
                  className="absolute w-full h-full inset-0 object-cover opacity-80"
                />{' '}
                <div className="relative my-2">
                  <p className="flex justify-center text-center text-3xl px-4">
                    1 on 1 call with Guido van Rossum
                  </p>
                  <p className="flex justify-center text-center">
                    This is the creator of Python!
                  </p>
                  <img
                    src="/divider.svg"
                    className="w-full object-cover absolute mt-2 opacity-60"
                  />
                  <div className="relative flex justify-center mt-4">
                    <div className="w-80 h-auto my-4 rounded-sm flex flex-col justify-center items-center">
                      <Image
                        src="/special1.png"
                        alt="Shop item"
                        className="w-full h-auto"
                        width="300"
                        height="300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative p-6 px-4 rounded-lg m-4 pop">
                <img
                  src="/shopback.svg"
                  alt="card backs"
                  className="absolute w-full h-full inset-0 object-cover opacity-80"
                />{' '}
                <div className="relative my-2">
                  <p className="flex justify-center text-center text-3xl px-4">
                    1 on 1 call with Anders Hejlsberg
                  </p>
                  <p className="flex justify-center text-center">
                    This is the creator of C# and Typescript!
                  </p>
                  <img
                    src="/divider.svg"
                    className="w-full object-cover absolute mt-2 opacity-60"
                  />
                  <div className="relative flex justify-center mt-4">
                    <div className="w-80 h-auto my-4 rounded-sm flex flex-col justify-center items-center">
                      <Image
                        src="/special2.png"
                        alt="Shop item"
                        className="w-full h-auto"
                        width="300"
                        height="300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 mb-48">
            <div className="flex justify-center items-center mb-8 m-5">
              <p className="text-5xl text-center mx-4 leading-[1.2]">
                What will{' '}
                <span
                  className="px-4 pb-2 rounded-md"
                  style={{
                    backgroundImage: 'url(/floorboard.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  you
                </span>{' '}
                make this winter?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8 mx-8 lg:mx-24 2xl:mx-64 mt-10">
              <div className="relative p-8 rounded-lg pop md:col-span-4 overflow-hidden">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative mx-5 md:my-5 md:mx-0">
                  <p className="text-2xl">Don't know where to start?</p>
                  <p className="text-lg mt-2">
                    Try out one of these Hack Club programs!
                  </p>
                  <ul className="mt-4 mb-2 text-lg list-disc ml-8">
                    <li>
                      <Link
                        href="https://boba.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Boba drops
                      </Link>
                      : Build a site, get boba!
                    </li>
                    <li>
                      <Link
                        href="https://fraps.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Hackaccino
                      </Link>
                      : Ship a 3D website, get a free Frappuccino!
                    </li>
                    <li>
                      <Link
                        href="https://cider.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Cider
                      </Link>
                      : Develop an iOS app, we&apos;ll cover the $100 AppStore
                      fee.
                    </li>
                    <li>
                      <Link
                        href="https://browserbuddy.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        BrowserBuddy
                      </Link>
                      : Develop a browser extension, we&apos;ll cover the Chrome
                      Developer Account fee + choose from 5 awesome prizes.
                    </li>
                    <li>
                      <Link
                        href="https://sprig.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Sprig
                      </Link>
                      : Make a video game, get a Console to play it on!
                    </li>
                    <li>
                      <Link
                        href="https://guides.hackclub.app/index.php/Main_Page"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="aboutLink"
                      >
                        Nest
                      </Link>
                      : Host your project's backend on Hack Club's free
                      open-source server!
                    </li>
                  </ul>
                  <p className="text-xl">
                    More workshops{' '}
                    <Link
                      href="https://jams.hackclub.com/"
                      target="_blank"
                      rel="noopenner noreferrer"
                      className="aboutLink"
                    >
                      here
                    </Link>
                    !
                  </p>
                </div>
              </div>
              <div className="relative p-8 rounded-lg pop md:col-span-6 overflow-hidden">
                <img
                  src="/howtobacks.svg"
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative mx-5 md:my-5 md:mx-0">
                  <p className="text-2xl">Or click the dino for ideas!</p>
                  <p className="text-lg mt-2">
                    She's not super smart, but she'll try her best—pirates'
                    honor!
                  </p>
                  <IdeaGenerator />
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="/bubbledivider.svg"
              className="w-full absolute -inset-y-28 md:-inset-y-60 2xl:-inset-y-80"
            />
          </div>
          <div
            className="bg-cover py-12 my-12"
            style={{
              backgroundImage: `url(/imgbkgr.png)`,
              width: '100%',
              height: 'auto',
            }}
          >
            <div className="relative my-12">
              <div className="flex flex-col justify-center text-center">
                <p className="text-5xl mt-12 mx-5 text-white leading-[1.2]">
                  Join a{' '}
                  <span
                    className="pb-2 px-4 rounded-md"
                    style={{
                      backgroundImage: 'url(/floorboard.svg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    community
                  </span>{' '}
                  of makers
                </p>
              </div>
            </div>

            <div className="">
              <div className="flex flex-wrap justify-center items-center gap-10">
                <div>
                  <img
                    src="/pictures/pic7.png"
                    alt="hack clubbers!"
                    className="max-w-[360px] sm:max-w-[420px] md:max-w-[500px] border-dashed border-4 p-4 border-blue-800"
                  />
                  <p className="flex flex-col justify-center items-center text-center mt-2">
                    <span>
                      Hack Clubbers at{' '}
                      <Link href="https://www.youtube.com/user/linustechtips">
                        Linus Tech Tips
                      </Link>
                      !
                    </span>
                  </p>
                </div>

                <iframe
                  className="w-[360px] h-[260px] sm:w-[420px] sm:h-[300px] md:w-[500px] md:h-[360px]"
                  src="https://www.youtube.com/embed/hiG3fYq3xUU"
                ></iframe>
              </div>

              <div className="flex flex-wrap justify-center items-center mb-12 gap-6 mx-5 my-12">
                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="/comback.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://ca.slack-edge.com/T0266FRGM-U06EMBJH71S-bea01757cf26-512"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @lou
                      </p>
                    </div>
                    <div>
                      <p className="text-sm ">today i worked on:</p>
                      <ul className="list-disc ml-5 text-sm mb-4">
                        <li>an assignment on DDE for my robotics class</li>
                        <li>
                          started working on my chip-8 emulator but i switched
                          tutorials since i wasn't rlly sure where to start. i
                          think im getting the idea so i might go back to the
                          one i was using to see if it makes more sense :)
                        </li>
                        <li>
                          contacting a boba shop for discounted boba for
                          counterspell since we're getting like 100
                        </li>
                      </ul>
                    </div>
                    <img src="https://cloud-3z0ux2fdz-hack-club-bot.vercel.app/0image.png" />
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="/comback.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://ca.slack-edge.com/T0266FRGM-U03PSH1MRAA-74b6914da04c-512"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @whackalenso
                      </p>
                    </div>
                    <p className="text-sm mb-4">
                      I finished my saxophone MIDI controller 🎷! It lets you
                      play any software instrument you’d like using saxophone
                      fingerings, allowing you to practice without disturbing
                      others, create music in any DAW, and perform with it.
                      Check it out at{' '}
                      <Link href="https://github.com/Whackalenso/CircuitSax">
                        https://github.com/Whackalenso/CircuitSax
                      </Link>
                    </p>
                    <img src="https://cloud-7kbp6qhfd-hack-club-bot.vercel.app/0image.png" />
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-md p-6 max-w-[22rem]">
                  <img
                    src="/comback.svg"
                    alt="image backing"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                  <div className="relative my-4">
                    <div className="flex flex-row mb-2">
                      <img
                        src="https://ca.slack-edge.com/T0266FRGM-U04G40QKAAD-c1f0fac3b324-512"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <p className="text-lg mb-2 flex flex-col justify-center">
                        @samuel
                      </p>
                    </div>
                    <p className="text-sm mb-4">
                      Just fixed some final bugs to ship the mobile app for Back
                      on Track America, a nonprofit organization dedicated to
                      serving the homeless and those suffering from food
                      insecurity by coordinating student volunteers in several
                      communities. The app allows volunteers to sign up for
                      their location, receive announcements from location
                      leaders, and discuss upcoming events! ⚒️ It's built with
                      React Native & NativeWind on the frontend, and using
                      Pocketbase on the backend. It's also now being submitted
                      for <Link href="https://cider.hackclub.com">#cider</Link>,
                      so that it can get published on the app store! An android
                      build on the play store is also coming soon. Check out the
                      code at https://github.com/backontrackus/app and
                      https://github.com/backontrackus/backend
                    </p>
                    {/* <img
                      src="https://scrapbook-into-the-redwoods.s3.amazonaws.com/e75cf24a-46d9-45fa-92d3-b9e5862d0d47-img_2442.jpg"
                      className="w-56"
                    /> */}
                  </div>
                </div>
              </div>

              <div className="mb-12 mt-12">
                <div className="flex flex-col justify-center text-center items-center">
                  <div className="flex flex-row gap-4">
                    <div
                      className="rounded-md p-2 max-w-2xl pop z-10"
                      style={{
                        backgroundImage: 'url(/floorboard.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Link
                        href="https://scrapbook.hackclub.com/"
                        target="_blank"
                        rel="noopenner noreferrer"
                        className="text-2xl mx-4"
                      >
                        See more projects →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="/bubbledivider.svg"
              className="w-full absolute -inset-y-36 md:-inset-y-64 2xl:-inset-y-80 scale-x-[-1]"
            />
          </div>
        </div>

        <div className="">
          <div className="flex justify-center items-center mb-5">
            <p className="text-5xl text-center mt-12">FAQ</p>
          </div>
          <div className="">
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
              <p className="text-4xl text-white mb-4">
                Build. Battle. Booty. Repeat.
              </p>
              <EmailSubmissionForm />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F567D7] p-8">
        <div className="xl:mx-44 md:mx-22 mt-4">
          <p className="mb-4 text-lg text-pink-950">
            A project by{' '}
            <Link
              href="https://hackclub.com/"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              Hack Club
            </Link>
          </p>
          <p className="max-w-2xl text-pink-800 text-sm">
            Hack Club is a 501(c)(3) nonprofit and network of 30k+ technical
            high schoolers. We believe you learn best by building so we{"'"}re
            creating community and providing grants so you can make awesome
            projects. In the past few years, we{"'"}ve{' '}
            <Link
              href="https://hackclub.com/arcade/"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              partnered with GitHub to run Arcade
            </Link>
            ,{' '}
            <Link
              href="https://github.com/hackclub/the-hacker-zephyr"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              {"hosted the world's longest hackathon on land"}
            </Link>
            , and{' '}
            <Link
              href="https://www.youtube.com/watch?v=QvCoISXfcE8"
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              {"ran Canada's largest high school hackathon"}
            </Link>
            . This server is currently on{' '}
            <Link
              href={`https://github.com/hackclub/high-seas/commit/${process.env.COMMIT_HASH}`}
              target="_blank"
              rel="noopenner noreferrer"
              className="footLink"
            >
              {process.env.COMMIT_HASH?.slice(0, 6)}
            </Link>{' '}
            commit.
          </p>
        </div>

        <div className="xl:mx-44 md:mx-22 mt-8">
          <div className="flex flex-wrap gap-x-24 gap-y-8">
            <div className="flex flex-col">
              <p className="mb-2 text-pink-800 text-xl">Hack Club</p>
              <div className="text-pink-700">
                <Link href="https://hackclub.com/philosophy/">Philosophy</Link>
                <br />
                <Link href="https://hackclub.com/team/">Our Team & Board</Link>
                <br />
                <Link href="https://hackclub.com/jobs/">Jobs</Link>
                <br />
                <Link href="https://hackclub.com/brand/">Branding</Link>
                <br />
                <Link href="https://hackclub.com/press/">Press Inquiries</Link>
                <br />
                <Link href="https://hackclub.com/philanthropy/">Donate</Link>
              </div>
            </div>

            <div className="flex flex-col">
              <p className="mb-2 text-pink-800 text-xl">Resources</p>
              <div className="text-pink-700">
                <Link href="https://events.hackclub.com/">
                  Community Events
                </Link>
                <br />
                <Link href="https://jams.hackclub.com/">Jams</Link>
                <br />
                <Link href="https://workshops.hackclub.com/">Workshops</Link>
                <br />
                <Link href="https://toolbox.hackclub.com/">Toolbox</Link>
                <br />
                <Link href="https://directory.hackclub.com/">
                  Clubs Directory
                </Link>
                <br />
                <Link href="https://hackclub.com/conduct/">
                  Code of Conduct
                </Link>
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
    </div>
  )
}

interface FaqCardProps {
  question: string
  answer: string
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
  )
}

interface FaqItem {
  question: string
  answer: string
}

const faqData: FaqItem[] = [
  {
    question: 'Who is eligible?',
    answer: `You need to be a high schooler (or younger).`,
  },
  {
    question: 'How much does it cost?',
    answer: `100% free - all the prizes are donated to us or paid for by us!`,
  },
  {
    question: 'What types of projects count?',
    answer: `Anything that you've programmed and is open-source!`,
  },
  {
    question: 'How many projects can I build?',
    answer: `All the projects! The land's the limit! (But seriously, you could build as many as you want.)`,
  },
  {
    question: 'I need help!',
    answer: `Read the big <a href="https://hack.club/high-seas-faq" target="_blank" ref="noopenner noreferrer" class="faqLink">FAQ</a>. Still stuck? Reach out in <a href="https://hackclub.slack.com/archives/C07PZNMBPBN" target="_blank" ref="noopenner noreferrer" class="faqLink">#high-seas-help</a> channel of the Hack Club Slack and we'll help you out!`,
  },
  {
    question: 'Does school work or a job count?',
    answer: `High Seas is about the joy of building for the sake of building. If you're building something for school or work, we can't count it.`,
  },
  {
    question: 'Is this legit?',
    answer: `Yup! This summer, we ran <a class="faqLink" href="https://hackclub.com/arcade/" target="_blank">Arcade</a>, which gave out similar prizes for working on personal projects.`,
  },
]

const Faq: React.FC = () => {
  return (
    <div className="p-5 flex flex-wrap justify-center items-center">
      {faqData.map((item, index) => (
        <FaqCard key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  )
}

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
  )
}

interface PrizeProps {
  name: string
  doubloons: number
  image: string
  sub: string | undefined
}
const nf = new Intl.NumberFormat()
const PrizeCard: React.FC<PrizeProps> = ({
  name,
  doubloons,
  image,
  sub,
  estMin,
  estMax,
}) => {
  return (
    <div className="relative p-6 px-4 rounded-lg m-4 pop">
      <img
        src="/shopback.svg"
        alt="card backs"
        className="absolute w-full h-full inset-0 object-cover opacity-80"
      />{' '}
      <p>
        ~{estMin}–{estMax} hours
      </p>
      <div className="relative my-2">
        <p className="flex justify-center text-center text-3xl">{name}</p>
        {sub && <p className="flex justify-center text-center">{sub}</p>}
        <img
          src="/divider.svg"
          className="w-full object-cover absolute mt-2 opacity-60"
        />
        <div className="relative">
          <div className="w-72 h-72 my-4 rounded-sm flex flex-col justify-center items-center">
            <Image
              src={image}
              alt="Shop item"
              className="w-full h-auto"
              width="300"
              height="300"
            />
          </div>
        </div>
      </div>
      <div
        className="absolute bg-purple-800 rotate-12 -right-2 top-0 p-1 px-4 rounded-sm"
        style={{
          backgroundImage: 'url(/floorboard.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-row gap-2">
          <img src="/doubloon.svg" className="w-7 h-8" />
          <p className="text-2xl">{nf.format(doubloons)}</p>
        </div>
      </div>
    </div>
  )
}

interface PrizeItem {
  name: string
  doubloons: string
  image: string
  estMin: number
  estMax: number
}

const PrizeData = [
  /*{
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
    name: "Free stickers!",
    doubloons: 0,
    image: "https://noras-secret-cdn.hackclub.dev/shop/free_stickers.png",
  }, */
  {
    name: 'Domain',
    doubloons: 40,
    image: 'https://cloud-bp5cbc3ab-hack-club-bot.vercel.app/0image.png',
    sub: 'for a year!',
    estMin: 2,
    estMax: 8,
  },
  // {
  //   name: "Raspberry Pi Zero",
  //   doubloons: 486,
  //   image: "https://cloud-a823iqif6-hack-club-bot.vercel.app/0image.png",
  // },
  {
    name: 'Pinecil',
    doubloons: 82,
    image: 'https://cloud-djbef06tx-hack-club-bot.vercel.app/0image.png',
    sub: 'solder!!',
    estMin: 3,
    estMax: 17,
  },
  // {
  //   name: "iFixit Kit",
  //   doubloons: 883,
  //   image: "https://cloud-1e0x3bwfz-hack-club-bot.vercel.app/0image.png",
  // },
  // {
  //   name: "Hack Club Socks",
  //   doubloons: 1300,
  //   image: "https://cloud-5z0d3mpqk-hack-club-bot.vercel.app/0image.png",
  // },
  {
    name: 'Blahåj (friend)',
    doubloons: 123,
    image: 'https://cloud-d8js788lz-hack-club-bot.vercel.app/0image.png',
    sub: 'soft to hold of the shark :3',
    estMin: 5,
    estMax: 26,
  },
  // {
  //   name: "Skeletool KBX",
  //   doubloons: 1420,
  //   image: "https://cloud-ak5er2k0m-hack-club-bot.vercel.app/0image.png",
  // },
  // {
  //   name: "YubiKey",
  //   doubloons: 1512,
  //   image: "https://cloud-oc60fts8l-hack-club-bot.vercel.app/0image.png",
  // },
  {
    name: 'Raspberry Pi 5',
    doubloons: 265,
    image: 'https://noras-secret-cdn.hackclub.dev/shop/raspberry_pi_5.png',
    sub: 'home server, mayhaps?',
    estMin: 11,
    estMax: 55,
  },
  {
    name: 'System76 Keeb',
    doubloons: 520,
    image: 'https://noras-secret-cdn.hackclub.dev/shop/s76_launch.png',
    sub: 'open-source!!!',
    estMin: 19,
    estMax: 94,
  },
  {
    name: 'Flipper Zero',
    doubloons: 850,
    image: 'https://noras-secret-cdn.hackclub.dev/shop/flipper.png',
    sub: "don't do anything i wouldn't do :-P",
    estMin: 35,
    estMax: 177,
  },
  // {
  //   name: "GitHub Backpack",
  //   doubloons: 46000,
  //   image: "https://noras-secret-cdn.hackclub.dev/shop/gh_miir_backpack.png",
  // },
  {
    name: 'Bambu A1 Mini',
    doubloons: 1000,
    image: 'https://noras-secret-cdn.hackclub.dev/shop/bambu_a1_mini.png',
    sub: 'what are you gonna print?',
    estMin: 42,
    estMax: 208,
  },
  {
    name: 'iPad',
    doubloons: 2090,
    image: 'https://noras-secret-cdn.hackclub.dev/shop/ipad.png',
    sub: 'with Apple Pencil!',
    estMin: 87,
    estMax: 435,
  },

  {
    name: 'Framework Laptop',
    doubloons: '4980',
    image: 'https://noras-secret-cdn.hackclub.dev/shop/fw_13.png',
    sub: '16", 16GB RAM....16 16 16',
    estMin: 208,
    estMax: 1037,
  },
]

const Prizes: React.FC = () => {
  return (
    <div className="p-5 flex flex-wrap justify-center items-center">
      {PrizeData.map((item, index) => (
        <PrizeCard
          key={index}
          name={item.name}
          doubloons={item.doubloons}
          image={item.image}
          sub={item.sub}
          estMin={item.estMin}
          estMax={item.estMax}
        />
      ))}
    </div>
  )
}
