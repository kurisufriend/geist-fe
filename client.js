backend = "wss://geist.silly.computer"


var dom_messages = document.getElementsByClassName("messages")[0];
var dom_textarea = document.getElementsByClassName("textbox")[0];

var config = {};

const urlParams = new URLSearchParams(window.location.search);
const nick = urlParams.get('nick');
config.username = nick

if (nick == "" || nick == null)
{
    document.location.href = "index.html?error="+encodeURIComponent("No nick specified! Choose a nick from the homepage.")
}

let ws = new WebSocket(backend)

let irc_users = [];
let geist_users = [];

ws.addEventListener('open', (event) => {
    console.log('connected');
    ws.send(JSON.stringify(
        {
            "type": "hi",
            "data": {"nick": nick}
        }
    ));
});

ws.addEventListener('message', (event) => {
    console.log('>>', event.data);
    let j = JSON.parse(event.data);
    if (j["type"] == "iusers")
    {
        irc_users = j["data"]["who"];
        update_users();
    }
    else if (j["type"] == "gusers")
    {
        geist_users = j["data"]["who"];
        update_users();
    }
    else if (j["type"] == "gmsg" || j["type"] == "imsg")
    {
	    dom_addmessage(j["data"]["author"], j["data"]["contents"], Date.now());
    }
    else if (j["type"] == "itopic")
    {
        document.getElementById("topic").textContent = j["data"]["topic"];
    }
    else if (j["type"] == "orientation")
    {
        document.getElementById("channel").textContent = j["data"]["channel"].slice(1);
    }
});

ws.addEventListener('close', (event) => {
    console.log('closed');
});

ws.addEventListener('error', (error) => {
    console.error(error);
});

function update_users()
{
    let irc_user_count = irc_users.length;
    let total_user_count = irc_user_count + geist_users.length;
    document.getElementById("users-count").textContent = total_user_count + " users";
    document.getElementById("users-count-irc").textContent = "("+irc_user_count + " IRC)";

    let geistlist = document.getElementById("geist-user-list");
    geistlist.innerHTML = "";
    geist_users.forEach(function(i) {
        let entry = document.createElement("li");
        entry.textContent = i;
        geistlist.appendChild(entry);
    });

    let irclist = document.getElementById("irc-user-list");
    irclist.innerHTML = "";
    irc_users.forEach(function(i) {
        let entry = document.createElement("li");
        entry.textContent = i;
        irclist.appendChild(entry);
    });
}

function dom_addmessage(username, message, timestamp)
{
	
	var div_message = document.createElement("div");
	div_message.className = "message";
	
	var span_username = document.createElement("span");
	span_username.className = "message-username";
	span_username.textContent = username;
	
	var span_timestamp = document.createElement("span");
	span_timestamp.className = "message-timestamp";
	span_timestamp.textContent = new Date(timestamp).toLocaleString();
	
	var div_content = document.createElement("div");
	div_content.className = "message-content";
	div_content.textContent = message;
	
	div_message.appendChild(span_username);
	div_message.appendChild(span_timestamp);
	div_message.appendChild(div_content);
	
	dom_messages.appendChild(div_message);
	
	dom_messages.scrollTop = dom_messages.scrollHeight;
}

function dom_send()
{
	if(dom_textarea.value.trim() == "")
    {
		return;
	}
	
    ws.send(JSON.stringify(
        {
            "type": "gmsg",
            "data": {"contents": dom_textarea.value}
        }
    ));

	dom_textarea.value = "";
}

dom_textarea.addEventListener("keydown", function(event)
{
	if(event.keyCode === 13){
		
		event.preventDefault();
		dom_send();
		return;
	}
});

function showusers(){
    let u = document.getElementById("users");
    if(window.getComputedStyle(u).display == "none")
    {
        document.querySelector(":root").style.setProperty("--users-display", "block");
        document.querySelector(":root").style.setProperty("--users-width", "100vw");
    }
    else
    {
        document.querySelector(":root").style.setProperty("--users-display", "none");
        document.querySelector(":root").style.setProperty("--users-width", "0vw");
    }
}
window.addEventListener("resize", function(){
    if(window.innerWidth > 650)
    {
        document.querySelector(":root").style.setProperty("--users-display", "block");
        document.querySelector(":root").style.setProperty("--users-width", "15vw");
    }
    else
    {
        document.querySelector(":root").style.setProperty("--users-display", "none");
        document.querySelector(":root").style.setProperty("--users-width", "0vw");
    }
})

