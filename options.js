// Saves options to chrome.storage.sync.
function save_options() {
  var rdp_user = document.getElementById('rdp_user').value;
  var ssh_user = document.getElementById('ssh_user').value;
  var always_override_user = document.getElementById('always_override_user').checked;

  chrome.storage.sync.set({
    rdp_user: rdp_user,
    ssh_user: ssh_user,
    always_override_user: always_override_user
  }, function() {
    window.close()
  });
}

// Restores select box and checkbox state using the preferences
function load_options() {
  chrome.storage.sync.get(default_data, function(items) {
    document.getElementById('rdp_user').value = items.rdp_user;
    document.getElementById('ssh_user').value = items.ssh_user;
    document.getElementById('always_override_user').checked = items.always_override_user;
  });
}
document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', save_options);

