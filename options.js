var default_data = {
  always_override_user: false,
  rdp_style: "MS",
  rdp_user: "Administrator",
  ssh_user: "ec2-user"
}

// Saves options to chrome.storage.sync.
function save_options() {
  var always_override_user = $("#always_override_user").is(":checked");
  var rdp_style = $("#rdp_style").val();
  var rdp_user = $("#rdp_user").val();
  var ssh_user = $("#ssh_user").val();

  chrome.storage.sync.set({
    always_override_user: always_override_user,
    rdp_style: rdp_style,
    rdp_user: rdp_user,
    ssh_user: ssh_user
  }, function() {
    window.close()
  });
}

// Restores select box and checkbox state using the preferences
function load_options() {
  manifest = chrome.runtime.getManifest();
  $("#version").html(manifest.version);
  chrome.storage.sync.get(default_data, function(items) {
    $("#always_override_user").prop("checked", items.always_override_user);
    $("#rdp_style").val(items.rdp_style);
    $("#rdp_user").val(items.rdp_user);
    $("#ssh_user").val(items.ssh_user);
  });
}

$( document ).ready(function() {
  load_options();
  $("#save").click(save_options);
});
