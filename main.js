import { init } from "./init";
export const domElements = {
  mute: document.getElementById("mute"),
  you: document.getElementById("you"),
  friend: document.getElementById("friend"),
  pause: document.getElementById("pause"),
  hangup: document.getElementById("hangup"),
  share: document.getElementById("share"),
};

domElements.friend.addEventListener("click", (e) => {
  if (e.target.classList.contains("small")) {
    e.target.classList.remove("small");
    e.target.classList.add("large");
    domElements.you.classList.add("small");
    domElements.you.classList.remove("large");
  } else {
    e.target.classList.remove("large");
    e.target.classList.add("small");
    domElements.you.classList.add("large");
    domElements.you.classList.remove("small");
  }
});
domElements.you.addEventListener("click", (e) => {
  if (e.target.classList.contains("small")) {
    e.target.classList.remove("small");
    e.target.classList.add("large");
    domElements.friend.classList.add("small");
    domElements.friend.classList.remove("large");
  } else {
    domElements.friend.classList.add("large");
    domElements.friend.classList.remove("small");
    e.target.classList.remove("large");
    e.target.classList.add("small");
  }
});
init();
