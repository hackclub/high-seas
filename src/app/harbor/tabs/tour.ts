import Shepherd, { type Tour } from 'shepherd.js'
import './shepherd.css'
import { offset } from '@floating-ui/dom'
import Cookies from 'js-cookie'
import { reportTourStep, safePerson } from '../../utils/airtable'

const waitForElement = (
  selector: string,
  callback = () => {},
): Promise<Element> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector)!)
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        callback()
        resolve(document.querySelector(selector)!)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

const setCookie = (
  name: string,
  value: string,
  days = 7,
  sameSite = 'strict',
) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};SameSite=${sameSite};path=/`
}

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

const t = new Shepherd.Tour({
  useModalOverlay: true,
  keyboardNavigation: false,
  defaultStepOptions: {
    scrollTo: true,
    modalOverlayOpeningPadding: 4,
    floatingUIOptions: { middleware: [offset(16)] },
    classes: 'shadow-md bg-purple-dark',
  },
})

let hasSetUp = false
export function tour() {
  safePerson().then(({ hasCompletedTutorial }) => {
    console.log('Setting tutorial sessionstorage to', hasCompletedTutorial)
    sessionStorage.setItem('tutorial', (!hasCompletedTutorial).toString())
  })

  const currentStepId = getCookie('tour-step')
  if (currentStepId) {
    const requiredUrl = stepToUrlMapping[currentStepId]
    if (requiredUrl && window.location.pathname !== requiredUrl) {
      window.location.href = requiredUrl
      return
    }

    if (
      currentStepId.startsWith('ts-draft-field-') ||
      currentStepId === 'ts-new-ship-explanation'
    ) {
      setCookie('tour-step', 'ts-draft-button')
    }
  } else {
    if (window.location.pathname !== '/shipyard') {
      window.location.href = '/shipyard'
      return
    }
  }

  if (!hasSetUp) {
    setupSteps(t)
    t.start()
    hasSetUp = true
  }
}

let signal, controller

function setupSteps(tourManager: Tour) {
  controller = new AbortController()
  signal = controller.signal

  tourManager.on('show', (e) => {
    if (e.step.id === 'ts-draft-field-submit') {
      setCookie('tour-step', 'ts-staged-ship-0')
    }

    if (e.step.id) {
      setCookie('tour-step', e.step.id)
    }

    reportTourStep(e.step.id)
  })

  tourManager.on('complete', async () => {
    sessionStorage.setItem('tutorial', 'false')
    Cookies.remove('academy-completed') // This will cause a refetch next page load.
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') e.preventDefault()
  })

  window.addEventListener('wheel', (event) => {
    const target = document.querySelector('.shepherd-target')
    if (target !== null) {
      event.preventDefault()
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    }
  })

  // ts stands for «tour step»
  const steps = [
    {
      id: 'ts-greet-1',
      text: `<div style="display:flex; flex-direction:column; align-items:center;">
              <img src="/trashbeard_pfp_1.png"></img>
              <p>
                timbers be shiverin' today, swabbie!! …at least, they are if yer here for Pirate Academy.
                <br /><br />
                that's what yer here for, right?? to go on account and sail the seven seas in search of booty????
                <br /><br />
                …if it sweetens the deal, all graduates of this fine academy are <strong style="color:#ec3750;">rewarded with a free pack of stickers.</strong>
                <br /><br />
                <i>good</i> stickers.
              </p>
            </div>`,
      buttons: [{ text: 'uh, sure', action: tourManager.next }],
    },
    {
      id: 'ts-greet-2',
      text: `<div style="display:flex; flex-direction:column; align-items:center;">
              <img src="/trashbeard_pfp_1.png"></img>
              <p>
                right then, let's weigh anchor and hoist the mizzen!! here's how this works.
                <br /><br />
                the first step of being a pirate is to build yerself a ship. pirates <i>love</i> ships. let's take a look at how to draft one!!
              </p>
            </div>`,
      buttons: [{ text: 'SGTM, buster', action: tourManager.next }],
    },
    {
      id: 'ts-draft-button',
      text: `ye have a project in the works. yer not ready to ship it, but ye want to see it drafted.
            <br/><br/>
            click that thar button…`,
      attachTo: {
        element: 'button#start-ship-draft',
        on: 'top',
      },
      beforeShowPromise: () => waitForElement('button#start-ship-draft'),
      advanceOn: {
        selector: 'button#start-ship-draft',
        event: 'click',
      },
    },
    {
      id: 'ts-new-ship-explanation',
      text: `here ye draft the ship. that means ye can set it up and see the hours, but nobody else can see it yet.`,
      beforeShowPromise: () => waitForElement('#new-ship-form-container-card'),
      buttons: [
        {
          text: 'uh-huh',
          action: tourManager.next,
        },
      ],
    },
    {
      id: 'ts-draft-field-title',
      text: `every ship needs a name!! we'll call this one "<span style='color: #ec3750;font-style: italic;'>Hack Club site</span>"`,
      attachTo: {
        element: '#title-field',
        on: 'top',
      },
      beforeShowPromise: () =>
        waitForElement('input#title', () => {
          document.querySelector('input#title')!.disabled = true
        }),
      buttons: [
        {
          text: 'got it',
          action: () => {
            const el: HTMLInputElement = document.querySelector('input#title')!
            el.value = 'Hack Club site'
            tourManager.next()
          },
        },
      ],
    },
    {
      id: 'ts-draft-field-project',
      text: `next ye link yer ship to <strong style='color: #ec3750;'>Hackatime</strong>, the Hack Club time-tracking tool. if ye haven't installed it yet… we'll get to that later.
            <br /><br />
            select <strong style='color: #ec3750;'>hack-club-site</strong> from the dropdown. when ye start coding for real, yer Hackatime hours will magically appear here!!`,
      attachTo: {
        element: '#project-field',
        on: 'top',
      },
      beforeShowPromise: () =>
        new Promise((r) => {
          controller = new AbortController()

          const el: HTMLInputElement = document.querySelector(
            'input#wakatime-project-name',
          )!

          document.addEventListener(
            'mousedown',
            () => {
              setTimeout(() => {
                if (el.value === 'hack-club-site') {
                  document.querySelector('.multiselect-close-button')!.click()
                  tourManager.next()
                }
              }, 500)
            },
            { signal: controller.signal },
          )
          r()
        }),
    },
    {
      id: 'ts-draft-field-repo',
      text: `every ship's code <i>must</i> live in a public git repo (and every git repo <strong style="color:#ec3750;"><i>must</i> have a README file!!</strong>)
            <br/><br/>
            most pirates these days use GitHub, but any git repo will do.`,
      attachTo: {
        element: '#repo-field',
        on: 'top',
      },
      beforeShowPromise: () =>
        new Promise((r) => {
          controller.abort()
          r()
        }),
      buttons: [
        {
          text: 'repo, gotcha',
          action: () => {
            const el: HTMLInputElement =
              document.querySelector('input#repo_url')!
            el.value = 'https://github.com/hackclub/site'

            document.querySelector('input#readme_url').value =
              'https://raw.githubusercontent.com/hackclub/site/refs/heads/main/README.md'

            tourManager.next()
          },
        },
      ],
    },
    {
      id: 'ts-draft-field-deployment',
      text: `now, for the most important part: the demo! this is what turns a <i>project</i> into a <i>ship</i>.
            <br /><br />
            other pirates <strong style="color:#ec3750;">must be able to experience your project</strong> as easily as possible… if they can't, yer sorry ship will sink!!!!
            <br /><br />
            webdev projects need a <strong style="color:#ec3750;">deployed website</strong>; everything else needs a <strong style="color:#ec3750;">YouTube video</strong>. in this case, we have <code>https://hackclub.com</code>.`,
      attachTo: {
        element: '#deployment-field',
        on: 'top',
      },
      buttons: [
        {
          text: 'a demo, aye!',
          action: () => {
            const el: HTMLInputElement = document.querySelector(
              '#deployment-field input',
            )!
            el.value = 'https://hackclub.com'
            tourManager.next()
          },
        },
      ],
    },
    {
      id: 'ts-draft-field-screenshot',
      text: `finally, yer ship needs an image so other pirates can size it up at a glance. <strong style="color:#ec3750;">appearances are important!!</strong>
            <br /><br />
            i'll give ye a link to use this time (but we have a neat image-upload tool in Slack called #cdn to make it easy for ye later)`,
      attachTo: {
        element: '#screenshot-field',
        on: 'top',
      },
      buttons: [
        {
          text: 'link please!',
          action: () => {
            const el: HTMLInputElement = document.querySelector(
              'input#screenshot_url',
            )!
            el.value =
              'https://cloud-lezyvcdxr-hack-club-bot.vercel.app/0image.png'
            tourManager.next()
          },
        },
      ],
    },
    {
      id: 'ts-draft-field-submit',
      text: 'now draft that ship!!',
      attachTo: {
        element: '#new-ship-submit',
        on: 'top',
      },
      advanceOn: {
        selector: '#new-ship-submit',
        event: 'click',
      },
    },
    {
      id: 'ts-staged-ship-0',
      text: `behold, yer drafted ship. ye can click these to edit them… but today, let's ship it right away.
            <br/><br/>
            beware, when ye ship the real thing there's no turning back. <strong style="color:#ec3750;">once a ship's in the water, ye can't take it out.</strong>
            <br/><br/>
            now <strong style="color:#ec3750;">ship that ship</strong>, yo-lo-lo!!!!`,
      attachTo: {
        element: '#staged-ships-container',
        on: 'top',
      },
      beforeShowPromise: () =>
        new Promise((r) => {
          document
            .querySelector('#staged-ships-container')!
            .addEventListener('click', (e) => {
              if (e.target.id === 'ship-ship') {
                tourManager.next()
              }
              e.stopPropagation()
            })
          r()
        }),
      advanceOn: {
        selector: 'button#ship-ship',
        event: 'click',
      },
    },
    // {
    //   id: "ts-staged-ship-play",
    //   text: "Here you can try out the Ship",
    //   attachTo: {
    //     element: "#selected-ship-play-button",
    //     on: "top",
    //   },
    //   advanceOn: {
    //     selector: "#selected-ship-play-button",
    //     event: "click",
    //   },
    // },
    // {
    //   id: "ts-staged-ship-repo",
    //   text: "Here you can view the associated GitHub repo!",
    //   attachTo: {
    //     element: "#selected-ship-repo-button",
    //     on: "top",
    //   },
    //   advanceOn: {
    //     selector: "#selected-ship-repo-button",
    //     event: "click",
    //   },
    // },
    // {
    //   id: "ts-staged-ship-edit",
    //   text: "Here you can edit some of your Ship's details",
    //   attachTo: {
    //     element: "#selected-ship-edit-button",
    //     on: "top",
    //   },
    //   advanceOn: {
    //     selector: "#selected-ship-edit-button",
    //     event: "click",
    //   },
    // },
    // {
    //   id: "ts-staged-ship-edit-title",
    //   text: "Try editing the name of the ship. Let's rename this Ship to \"<span style='color: #ec3750;'>Hack Club's Awesome Website</span>\"",
    //   attachTo: {
    //     element: "form#selected-ship-edit-form input#title",
    //     on: "top",
    //   },
    //   beforeShowPromise: () => {
    //     return waitForElement(
    //       "form#selected-ship-edit-form input#title",
    //       () => {
    //         const f: HTMLInputElement = document.querySelector(
    //           "form#selected-ship-edit-form input#title",
    //         )!;
    //         f.focus();
    //         f.addEventListener(
    //           "input",
    //           ({ target }: { target: HTMLInputElement }) => {
    //             if (
    //               target.value.trim().toLowerCase() ===
    //               "hack club's awesome website"
    //             ) {
    //               f.blur();
    //               tourManager.next();
    //             }
    //           },
    //         );
    //       },
    //     );
    //   },
    // },
    // {
    //   id: "ts-staged-ship-edit-save",
    //   text: "Now save it!",
    //   attachTo: {
    //     element: "form#selected-ship-edit-form button#submit",
    //     on: "top",
    //   },
    //   advanceOn: {
    //     selector: "form#selected-ship-edit-form button#submit",
    //     event: "click",
    //   },
    // },
    {
      id: 'ts-staged-ship-edit-finale',
      text: `when ye ship a project, the next place it goes is the Wonderdome. that's where we'll go next, too.
            <br /><br />
            to get yer Doubloons, <strong style="color:#ec3750;">ye must cast yer share of votes</strong> in the Wonderdome for each project ye ship… and yer ship must weather its share of votes from yer peers!`,
      buttons: [
        {
          text: 'Wonderdome, ho!!!',
          action: () => {
            setCookie('tour-step', 'ts-vote-left')
            window.location.href = '/wonderdome'
          },
        },
      ],
    },
    // {
    //   id: "ts-vote-intro",
    //   text: "Welcome to the Wonderdome, where you'll vote on projects!<br /><br />All you need to do is pick which project you think is better, and explain why.<br /><br />Remember to check out the live link to test it out, and the repo to look at the code!<br /><br /><b>[Ominously]</b> I'll know if you don't check the links...",
    //   buttons: [
    //     {
    //       text: "Next",
    //       action: tourManager.next,
    //     },
    //   ],
    // },
    {
      id: 'ts-vote-left',
      text: `here we see a battle between ships. each has a readme, a demo, and a repo. consider each ship with care, and make yer selection accordingly!!
            <br /><br />
            word to the wise… prosperous pirates take time with their votes, for <strong style="color:#ec3750;">the ocean can tell when ye vote without care. and legends say it will punish ye for it!!!!</strong>
            <br /><br />
            click the <strong style="color:#ec3750;">Demo</strong> button to experience this lovely ship!!`,
      attachTo: {
        element: '#voting-project-left #live-demo-link',
        on: 'top',
      },
      beforeShowPromise: () => {
        // return new Promise((r) => setTimeout(r, 3_000));

        return waitForElement(
          '#voting-project-left button#readme-button',
          () => {
            document.querySelector!(
              '#voting-project-left button#readme-button',
            )?.setAttribute('disabled', 'true')
          },
        )
      },
      advanceOn: {
        selector: '#voting-project-left #live-demo-link',
        event: 'click',
      },
    },
    {
      id: 'ts-vote-left',
      text: `I know ye haven't seen the other ship, but say ye chose this one. click here to vote for it!!`,
      attachTo: {
        element: '#voting-project-left button#vote-button',
        on: 'top',
      },
      advanceOn: {
        selector: '#voting-project-left button#vote-button',
        event: 'click',
      },
    },
    {
      id: 'ts-vote-reason-submit',
      text: `this next part's important: explain yer decision!! write at least ten words about why ye made this choice. i've given ye an example of a good sentence here.
            <br/><br/>
            worry not, the other pirates can't see yer votes or what ye write (…but keep in mind, <strong style="color:#ec3750;">the High Seas Team can!!</strong>)`,
      attachTo: {
        element: '#voting-reason-container-parent',
        on: 'top',
      },
      beforeShowPromise: () => {
        return waitForElement('#voting-reason-container')
      },
      advanceOn: {
        selector: 'button#submit-vote',
        event: 'click',
      },
    },
    {
      id: 'ts-vote-reason-finale',
      text: `yer first vote is cast!! <strong style="color:#ec3750;">cast a dozen votes for each of yer ships</strong> and the doubloons will roll in. now let's move on to the best part… the <i>spending.</i>`,
      focusedElBeforeOpen: false,
      buttons: [
        {
          text: 'to the shop!!!',
          action: () => {
            setCookie('tour-step', 'ts-shop-welcome')
            location.href = '/shop'
          },
        },
      ],
    },
    {
      id: 'ts-shop-welcome',
      text: 'welcome to the pirate shop, yer one-stop-shop for the booty all pirates need!! today, ye get stickers. tomorrow, a MacBook.',
      buttons: [
        {
          text: 'ok',
          action: tourManager.next,
        },
      ],
    },
    {
      id: 'ts-shop-region',
      text: 'first ye must select yer region. booty prices and availability can be a bit different depending on where you are…',
      attachTo: {
        element: '#region-select',
        on: 'top',
      },
      advanceOn: {
        selector: '#region-select select',
        event: 'change',
      },
    },
    {
      id: 'ts-shop-free-stickers',
      text: 'now is your chance!! plunder the stickers before they get away!!!!',
      attachTo: {
        element: '#item_free_stickers_41',
        on: 'top',
      },
      beforeShowPromise: () => {
        const btn = document.querySelector('#item_free_stickers_41')

        if (!btn) {
          throw new Error('WhERE IS THE BUTTON??!?!?!??!')
        }

        btn.addEventListener('click', (e) => {
          e.preventDefault()
          setCookie('tour-step', 'ts-signpost')
          location.pathname = '/api/buy/item_free_stickers_41'
        })
      },
    },
    {
      id: 'ts-signpost',
      text: `<div>
              <img src="/trashbeard_pfp_1.png" style="margin-left: auto; margin-right: auto;" />
              <p>
                And so concludes our tutorial. which brings us to Step 3:
                <ol class="my-4">
                  <li style="text-decoration: line-through;">1. Join Slack</li>
                  <li style="text-decoration: line-through;">2. Do the Tutorial</li>
                  <li style="font-weight: bold;">3. Install Hackatime <span style="font-weight: normal; font-stlye: italic;">← you are here</span></li>
                </ol>
                Hackatime is the system we use to count yer hours. <strong style="color:#ec3750;">Follow the installation instructions on this page!</strong> Once it's installed, any code ye write will count for High Seas.
                <br/><br/>
                good luck to ye 🫡
              </p>
            </div>
            `,
      buttons: [
        {
          text: 'I shall install Hackatime immediately!',
          action: tourManager.complete,
        },
      ],
    },
  ]

  const currentStepId = getCookie('tour-step')

  if (currentStepId) {
    const currentStepIndex = steps.findIndex(
      (step) => step.id === currentStepId,
    )
    if (currentStepIndex !== -1) {
      steps.splice(0, currentStepIndex)
    }
  }

  tourManager.addSteps(steps)
}
// because mapping is ezy & nice
const stepToUrlMapping: Record<string, string> = {
  'ts-greet-1': '/shipyard',
  'ts-greet-2': '/shipyard',
  'ts-draft-button': '/shipyard',
  'ts-new-ship-explanation': '/shipyard',
  'ts-draft-field-title': '/shipyard',
  'ts-draft-field-project': '/shipyard',
  'ts-draft-field-repo': '/shipyard',
  'ts-draft-field-deployment': '/shipyard',
  'ts-draft-field-screenshot': '/shipyard',
  'ts-draft-field-submit': '/shipyard',
  'ts-staged-ship-0': '/shipyard',
  'ts-staged-ship-edit-finale': '/shipyard',
  'ts-vote-left': '/wonderdome',
  'ts-vote-reason-submit': '/wonderdome',
  'ts-vote-reason-finale': '/wonderdome',
  'ts-shop-welcome': '/shop',
  'ts-shop-region': '/shop',
  'ts-shop-free-stickers': '/shop',
  'ts-signpost': '/signpost',
}
