var default_options = {
  ssh_user: "ec2-user",
  always_override_user: false,
  rdp_user: "Administrator",
  rdp_style: "MS",
}

var options = {}
function get_options() {
  chrome.storage.sync.get(default_options, function(items) {
    options = items
  })
}

get_options()
chrome.storage.onChanged.addListener(function() {
  get_options()
  // remove all links
  var links = document.querySelectorAll(".awssshrdplink")
  for (var i=0; i < links.length; i++) {
    links[i].parentNode.removeChild(links[i])
  }
  // add new links
  window.setTimeout(go, 10)
})

// poll at a high frequency until the "detailsPublicDNS" element has loaded
// the instance details have finished loaded when this element appears
// after this, rely on the click and keyup events below to add new SSH links when the selection changes
var load_timer = setInterval(function() {
  if (document.getElementById("detailsPublicDNS")) {
    clearInterval(load_timer)
    window.setTimeout(function() {
      go()
    }, 1000)
  }
}, 100)

document.addEventListener("click", function() {
  setTimeout(go, 500)
})
document.addEventListener("keyup", function() {
  setTimeout(go, 1000)
})

function get_selector(row, col) {
  // nth-child is 1-indexed!
  return document.querySelector(`.gwt-TabLayoutPanelContent table > tbody tr:nth-child(${row}) > td:nth-child(${col}) div:nth-child(2)`)
}

function go() {
  if (!window.location.hash.startsWith("#Instances:")) return

  var active_tab = document.querySelector(".gwt-TabLayoutPanelContent > div:not([aria-hidden])")
  if (!active_tab || active_tab.children.length == 0 || active_tab.children[0].tagName == "UL") {
    // multiple instances are selected
    return
  }

  var elastic_ips = get_selector(5, 1)
  if (elastic_ips) {
    var list_items = elastic_ips.getElementsByTagName("li")
    for (var i=0; i < list_items.length; i++) {
      add_to_element(list_items[i])
    }
  }

  add_to_element(get_selector(2, 2)) // Public DNS (IPv4)
  add_to_element(get_selector(3, 2)) // IPv4 Public IP
  add_to_element(get_selector(4, 2)) // IPv6 IPs
  add_to_element(get_selector(5, 2)) // Private DNS
  add_to_element(get_selector(6, 2)) // Private IPs
  add_to_element(get_selector(7, 2)) // Secondary private IPs

  // Top bar "Public DNS" / "Private IP" / "Elastic IP"
  var instance = document.querySelector("span[style^='padding-left: 5px;']")
  if (instance) {
    add_to_element(instance.parentNode.lastChild)
  }
}

function add_to_element(el) {
  if (!el || el.querySelector(".awssshrdplink")) {
    // do not add multiple times
    return
  }

  var text = el.textContent.trim()

  if (text.endsWith(" IPs")) {
    // instances with multiple IPv6 addresses have a link that brings up a popup with the list of addresses ("2 IPs")
    return
  }

  if (text.startsWith("Private IP: ")) {
    text = text.substring("Private IP: ".length)
  }
  else if (text.startsWith("Public DNS: ")) {
    text = text.substring("Public DNS: ".length)
  }
  else if (text.startsWith("Elastic IP: ")) {
    text = text.substring("Elastic IP: ".length)
  }
  else if (text.endsWith("*")) {
    // remove * from EIP
    text = text.substr(0, text.length-1)
  }
  else if (text.indexOf(",") != -1) {
    // multiple Secondary private IPs; only use the first one
    text = text.substr(0, text.indexOf(","))
  }

  // put IPv6 inside []
  if (text.indexOf(":") != -1) {
    text = `[${text}]`
  }

  if (text.indexOf("-") == 0 || text.trim() == "") {
    return
  }

  var link = document.createElement("a")
  link.className = "awssshrdplink"

  var platform = get_selector(10, 1)
  if (platform.textContent == "windows") {
    link.setAttribute("data-link-text", "RDP")
    var user = options["rdp_user"]

    if (options["rdp_style"] == "MS") {
      var query_string_opts = []
      if (user != "") {
        query_string_opts.push("username=s:"+user)
      }
      query_string_opts.push("full%20address=s:"+text+":3389")
      var query_string = query_string_opts.join("&")
      link.href = "rdp://"+query_string
    }
    else if (options["rdp_style"] == "CoRD") {
      link.href = "rdp://"+(user?`${user}@`:"")+text
    }
  }
  else {
    link.setAttribute("data-link-text", "SSH")
    var user = get_ssh_user()
    link.href = "ssh://"+(user?`${user}@`:"")+text
  }

  el.classList.add("awssshrdp-element")
  if (el.children.length > 1) {
    // add link before the copy to clipboard button
    el.insertBefore(link, el.lastChild)
  }
  else {
    el.appendChild(link)
  }
}

function get_ssh_user() {
  if (options["always_override_user"])
    return options["ssh_user"]

  var ami = get_selector(9, 1)
  if (!ami)
    return options["ssh_user"]

  ami = ami.textContent
  if (ami.indexOf("ubuntu") > -1)
    return "ubuntu"
  else if (ami.indexOf("amzn") > -1)
    return "ec2-user"
  else if (ami.indexOf("RHEL") > -1)
    return "ec2-user"
  else if (ami.indexOf("suse-sles") > -1)
    return "ec2-user"
  else if (ami.indexOf("CoreOS") > -1)
    return "core"

  return options["ssh_user"]
}
