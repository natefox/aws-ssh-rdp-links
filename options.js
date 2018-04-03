var default_options = {
  ssh_user: "ec2-user",
  always_override_user: false,
  rdp_user: "Administrator",
  rdp_style: "MS",
}

function save_options() {
  chrome.storage.sync.set({
    ssh_user: document.getElementById("ssh_user").value,
    always_override_user: document.getElementById("always_override_user").checked,
    rdp_user: document.getElementById("rdp_user").value,
    rdp_style: document.getElementById("rdp_style").value,
  }, function() {
    console.log("saved!")
  })
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("version").textContent = chrome.runtime.getManifest().version
  chrome.storage.sync.get(default_options, function(items) {
    document.getElementById("ssh_user").value = items.ssh_user
    document.getElementById("always_override_user").checked = items.always_override_user
    document.getElementById("rdp_user").value = items.rdp_user
    document.getElementById("rdp_style").value = items.rdp_style
  })
  document.getElementById("ssh_user").addEventListener("input", save_options)
  document.getElementById("always_override_user").addEventListener("click", save_options)
  document.getElementById("rdp_user").addEventListener("input", save_options)
  document.getElementById("rdp_style").addEventListener("change", save_options)
})
