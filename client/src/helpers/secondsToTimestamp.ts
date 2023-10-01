export default function secondsToTimestamp(seconds: number, alwaysShow?: "hours" | "minutes") {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);

  let showHours = hours > 0;
  let showMinutes = minutes > 0;

  if (alwaysShow === "hours") {
    showHours = true;
    showMinutes = true;
  }
  else if (alwaysShow === "minutes") {
    showHours = false;
    showMinutes = true;
  }
  
  
  return `${
    showHours ? hours.toString().padStart(2, "0") + ":" : ""
  }${
    showMinutes ? minutes.toString().padStart(2, "0") + ":" : ""
  }${
    secondsLeft < 10 ? "0" : ""}${secondsLeft
  }`;
}