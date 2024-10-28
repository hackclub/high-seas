import Shepherd, { Tour } from "shepherd.js";
import "./shepherd.css";
import { offset } from "@floating-ui/dom";
import { markAcademyComplete } from "./tutorial-utils";

const waitForElement = (
  selector: string,
  callback = () => {},
): Promise<Element> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector)!);
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        callback();
        resolve(document.querySelector(selector)!);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const setCookie = (name: string, value: string, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name: string): string | null => {
  console.log(document.cookie);
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};

const t = new Shepherd.Tour({
  useModalOverlay: true,
  keyboardNavigation: false,
  defaultStepOptions: {
    scrollTo: false,
    modalOverlayOpeningPadding: 4,
    floatingUIOptions: { middleware: [offset(16)] },
    classes: "shadow-md bg-purple-dark",
  },
});

let hasSetUp = false;
export function tour() {
  if (!hasSetUp) {
    setupSteps(t);
    t.start();
    hasSetUp = true;
  }

  console.log(t.steps);
}

let signal, controller;

function setupSteps(tourManager: Tour) {
  controller = new AbortController();
  signal = controller.signal;

  tourManager.on("show", (e) => {
    if (e.step.id === "ts-draft-field-submit") {
      setCookie("tour-step", "ts-staged-ship-0");
    }
  });

  tourManager.on("complete", async () => {
    sessionStorage.setItem("tutorial", "false");
    markAcademyComplete();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") e.preventDefault();
  });

  const steps = [
    {
      id: "ts-draft-button",
      text: "Let's create a new ship!",
      attachTo: {
        element: "button#start-ship-draft",
        on: "top",
      },
      beforeShowPromise: () => waitForElement("button#start-ship-draft"),
      advanceOn: {
        selector: "button#start-ship-draft",
        event: "click",
      },
    },
    {
      id: "ts-new-ship-explanation",
      text: "This is where you'll enter the info for the project you want to ship.",
      beforeShowPromise: () => waitForElement("#new-ship-form-container-card"),
      buttons: [
        {
          text: "Understood",
          action: tourManager.next,
        },
      ],
    },
    {
      id: "ts-draft-field-title",
      text: "Every Ship needs a name! [Insert funny quip].<br /><br />We're going to name this one \"<span style='color: #ec3750;font-style: italic;'>Hack Club site</span>\"!",
      attachTo: {
        element: "#title-field",
        on: "top",
      },
      beforeShowPromise: () =>
        waitForElement("input#title", () => {
          document.querySelector("input#title")!.disabled = true;
        }),
      buttons: [
        {
          text: "Next",
          action: () => {
            const el: HTMLInputElement = document.querySelector("input#title")!;
            el.value = "Hack Club site";
            tourManager.next();
          },
        },
      ],
    },
    {
      id: "ts-draft-field-project",
      text: "Next, we need to link your coding time with the Ship. Remember that extension you installed?<br /><br />For the sake of time, select <span style='color: #ec3750;'>hack-club-site</span>.<br /><br />When you start coding for real, your actual projects will magically appear here! Cool, right?<br /><br />Make sure to hit close once you're done!",
      attachTo: {
        element: "#project-field",
        on: "top",
      },
      beforeShowPromise: () =>
        new Promise((r) => {
          controller = new AbortController();

          const el: HTMLInputElement = document.querySelector(
            "input#wakatime-project-name",
          )!;

          document.addEventListener(
            "mousedown",
            (e) => {
              if (e.target.classList.contains("multiselect-close-button")) {
                setTimeout(() => {
                  console.log(el.value);
                  if (el.value === "hack-club-site") {
                    tourManager.next();
                  }
                }, 10);
              }
            },
            { signal: controller.signal },
          );
          r();
        }),
    },
    {
      id: "ts-draft-field-repo",
      text: "You also need to link a git repo (where your code is stored) - we <3 open source.<br /><br />If you enter a GitHub repo URL, we'll automagically infer the README url, so you don't have to input it in the README field below. As such, we'll skip over it right now :)",
      attachTo: {
        element: "#repo-field",
        on: "top",
      },
      beforeShowPromise: () =>
        new Promise((r) => {
          controller.abort();
          r();
        }),
      buttons: [
        {
          text: "Next",
          action: () => {
            const el: HTMLInputElement =
              document.querySelector("input#repo_url")!;
            el.value = "https://github.com/hackclub/site";

            document.querySelector("input#readme_url").value =
              "https://raw.githubusercontent.com/hackclub/site/refs/heads/main/README.md";

            tourManager.next();
          },
        },
      ],
    },
    {
      id: "ts-draft-field-deployment",
      text: "Here, we'll put a link to your deployed project so people can actually test out and play with it!<br /><br />In this case, it's <code>https://hackclub.com</code>.",
      attachTo: {
        element: "#deployment-field",
        on: "top",
      },
      buttons: [
        {
          text: "Next",
          action: () => {
            const el: HTMLInputElement = document.querySelector(
              "#deployment-field input",
            )!;
            el.value = "https://hackclub.com";
            tourManager.next();
          },
        },
      ],
    },
    {
      id: "ts-draft-field-screenshot",
      text: "Finally, we want to add a photo of our project, so others can get the vibe of it at a glance.<br /><br />I've provided one for you this time, but when you ship your own Ship for real, you'll need to upload a screenshot yourself!",
      attachTo: {
        element: "#screenshot-field",
        on: "top",
      },
      buttons: [
        {
          text: "Aye aye!",
          action: () => {
            const el: HTMLInputElement = document.querySelector(
              "input#screenshot_url",
            )!;
            el.value =
              "https://cloud-g94jve4yq-hack-club-bot.vercel.app/0cca0381f-7e1c-485f-a533-31340b1245d6_1_105_c.jpeg";
            tourManager.next();
          },
        },
      ],
    },
    {
      id: "ts-draft-field-submit",
      text: "Go ahead and submit your ship!",
      attachTo: {
        element: "#new-ship-submit",
        on: "top",
      },
      advanceOn: {
        selector: "#new-ship-submit",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-0",
      text: "Let's have a look at the draft ship you just created!",
      attachTo: {
        element: "#staged-ships-container",
        on: "top",
      },
      beforeShowPromise: () =>
        waitForElement("#staged-ships-container", () => {
          controller = new AbortController();
          signal = controller.signal;

          document
            .querySelector("button#ship-ship")!
            .addEventListener("click", (e) => e.stopPropagation(), { signal });
        }),
      advanceOn: {
        selector: "#staged-ships-container",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-card",
      text: "Here's your Ship",
      beforeShowPromise: () => waitForElement("#selected-ship-card"),
      buttons: [
        {
          text: "Next",
          action: tourManager.next,
        },
      ],
    },
    {
      id: "ts-staged-ship-play",
      text: "Here you can try out the Ship",
      attachTo: {
        element: "#selected-ship-play-button",
        on: "top",
      },
      advanceOn: {
        selector: "#selected-ship-play-button",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-repo",
      text: "Here you can view the associated GitHub repo!",
      attachTo: {
        element: "#selected-ship-repo-button",
        on: "top",
      },
      advanceOn: {
        selector: "#selected-ship-repo-button",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-edit",
      text: "Here you can edit some of your Ship's details",
      attachTo: {
        element: "#selected-ship-edit-button",
        on: "top",
      },
      advanceOn: {
        selector: "#selected-ship-edit-button",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-edit-title",
      text: "Try editing the name of the ship. Let's rename this Ship to \"<span style='color: #ec3750;'>Hack Club's Awesome Website</span>\"",
      attachTo: {
        element: "form#selected-ship-edit-form input#title",
        on: "top",
      },
      beforeShowPromise: () => {
        return waitForElement(
          "form#selected-ship-edit-form input#title",
          () => {
            const f: HTMLInputElement = document.querySelector(
              "form#selected-ship-edit-form input#title",
            )!;
            f.focus();
            f.addEventListener(
              "input",
              ({ target }: { target: HTMLInputElement }) => {
                if (
                  target.value.trim().toLowerCase() ===
                  "hack club's awesome website"
                ) {
                  f.blur();
                  tourManager.next();
                }
              },
            );
          },
        );
      },
    },
    {
      id: "ts-staged-ship-edit-save",
      text: "Now save it!",
      attachTo: {
        element: "form#selected-ship-edit-form button#submit",
        on: "top",
      },
      advanceOn: {
        selector: "form#selected-ship-edit-form button#submit",
        event: "click",
      },
    },
    {
      id: "ts-staged-ship-edit-finale",
      text: "Great! The new name suits our project perfectly.<br /><br />Now let's head to the Wonderdome to vote on some projects.",
      buttons: [
        {
          text: "Let's go!",
          action: () => {
            setCookie("tour-step", "ts-vote-left");
            window.location.href = "/wonderdome";
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
      id: "ts-vote-left",
      text: "Here we have a Ship.<br /><br />Check out the repo version by clicking on the <i>Repository</i> button!",
      attachTo: {
        element: "#voting-project-left",
        on: "top",
      },
      beforeShowPromise: () => {
        // return new Promise((r) => setTimeout(r, 3_000));
        return waitForElement("#voting-project-left", () => {
          document.querySelector!(
            "#voting-project-left button#readme-button",
          ).disabled = true;
        });
      },
      advanceOn: {
        selector: "#voting-project-left #repository-link",
        event: "click",
      },
    },
    {
      id: "ts-vote-left",
      text: "Click here to vote for it!",
      attachTo: {
        element: "#voting-project-left button#vote-button",
        on: "top",
      },
      advanceOn: {
        selector: "#voting-project-left button#vote-button",
        event: "click",
      },
    },
    {
      id: "ts-vote-reason-submit",
      text: "You can now submit your vote! Explain why it's better than the other project (make sure you write over 10 words!)",
      attachTo: {
        element: "#voting-reason-container-parent",
        on: "top",
      },
      beforeShowPromise: () => {
        return waitForElement("#voting-reason-container");
      },
      advanceOn: {
        selector: "button#submit-vote",
        event: "click",
      },
    },
    {
      id: "ts-vote-reason-finale",
      text: "Awesome! Let's head to the shop",
      focusedElBeforeOpen: false,
      buttons: [
        {
          text: "ok",
          action: () => {
            setCookie("tour-step", "ts-shop-welcome");
            location.href = "/shop";
          },
        },
      ],
    },
    {
      id: "ts-shop-welcome",
      text: "Welcome to the shop!",
      buttons: [
        {
          text: "ok",
          action: tourManager.next,
        },
      ],
    },
    {
      id: "ts-shop-region",
      text: "Pick a region",
      attachTo: {
        element: "#region-select",
        on: "top",
      },
      advanceOn: {
        selector: "#region-select select",
        event: "change",
      },
    },
    {
      id: "ts-shop-free-stickers",
      text: "Pick the free stickers!",
      attachTo: {
        element: "#item_free_stickers_41",
        on: "top",
      },
      beforeShowPromise: () => {
        const btn = document.querySelector("#item_free_stickers_41");

        if (!btn) {
          throw new Error("WhERE IS THE BUTTON??!?!?!??!");
        }

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          console.log("clicked!");
          setCookie("tour-step", "ts-signpost");
          location.pathname = "/api/buy/item_free_stickers_41";
        });
      },
    },
    {
      id: "ts-signpost",
      text: "As soon as we verify your age, your stickers will ship, and you can start shipping projects.<br /><br />In the meantime, feel free to get hacking. Your hours are safe, as long as you have HackaTime installed!",
      buttons: [
        {
          text: "Great!",
          action: tourManager.complete,
        },
      ],
    },
  ];

  const currentStepId = getCookie("tour-step");

  if (currentStepId) {
    const currentStepIndex = steps.findIndex(
      (step) => step.id === currentStepId,
    );
    if (currentStepIndex !== -1) {
      steps.splice(0, currentStepIndex);
    }
  }

  tourManager.addSteps(steps);
}
