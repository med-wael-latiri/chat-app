//server(emit)->client(receive)--achnowledgement-->server
//client(emit)->server(receive)--achnowledgement-->client

const socket = io();
//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $SendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const Locationtemplate = document.querySelector("#Location-template").innerHTML;
const sidebartemplate = document.querySelector("#sidebar-template").innerHTML;
//option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoscroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;
  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageheight = $newMessage.offsetHeight + newMessageMargin;
  //visible height
  const visibleHeight = $messages.offsetHeight;
  //height of messages container
  const containerHeight = $messages.scrollHeight;
  //how far have i scrolled
  const scrolloffset = $messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageheight <= scrolloffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }

  console.log(newMessageMargin);
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebartemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("locationMessage", (message) => {
  console.log(url);
  const html = Mustache.render(Locationtemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  //disable the form
  const message = e.target.elements.message.value;
  socket.emit("sendmessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled", "disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    //enable
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

$SendLocation.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $SendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendlocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $SendLocation.removeAttribute("disabled", "disabled");
        console.log("Location Shared");
      }
    );
  });
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
