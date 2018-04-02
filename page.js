var saved_data = {}
var default_data = {
  always_override_user: false,
  rdp_style: "MS",
  rdp_user: "Administrator",
  ssh_user: "ec2-user"
}

chrome.storage.onChanged.addListener(function(){
  get_storage();
})

// I really want something like this!
// http://stackoverflow.com/a/3597640/517606
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(get_storage, 4000);
  $(document).click(function(){
    get_storage();
  })
});


function get_storage() {
  if (!window.location.hash.startsWith("#Instances")) return;
  chrome.storage.sync.get(default_data, function(items){
    saved_data = items
    window.setTimeout(function(){
      go();
    }, 400);
  })
}

function go() {
  private_dns = get_selector(4,1);
  private_ip = get_selector(5,1);

  public_dns = get_selector(1,1);
  public_ip = get_selector(2,1);

  ipv6_ip = get_selector(3,1);

  elastic_ips = get_selector(4,0);
  elastic_ips.find("li").each(function(i, eip) {
    add_to_field($(eip))
  });

  top_row = $("div.HOB span:eq(2)")

  add_to_field(private_ip)
  add_to_field(public_ip)

  add_to_field(ipv6_ip)

  add_to_field(private_dns)
  add_to_field(public_dns)
  add_to_field(top_row, true)
}

function add_to_field(fld, is_top_row = false) {
  if (fld.find("a").length > 0) {
    // e.g. IPv6 with more than one address, then it's a link saying just "2 IPs" (with a popup that shows the IPs on mouseover)
    return
  }

  field_text = (is_top_row)
    // grab last item via reverse->first item
    ? fld.contents().first().text().split(" ").reverse()[0]
    : fld.contents().first().text()

  // remove * from EIP
  if (field_text.endsWith("*")) {
    field_text = field_text.substr(0, field_text.length-1);
  }

  // put IPv6 inside []
  if (field_text.indexOf(":") != -1) {
    field_text = `[${field_text}]`;
  }

  if (field_text.indexOf("-") == 0 || field_text.trim().length == 0)
    return

  span = ($("span.awssshrdplink", fld).length)
          ? $("span.awssshrdplink", fld).empty()
          : $("<span />", {class: "awssshrdplink"})

  platform = get_selector(9,0).text();

  str_to_add = (platform == "windows")
              ? create_rdp(field_text)
              : create_ssh(field_text)

  span.append(str_to_add)
  fld.append(span)
}

function create_ssh(host) {
  user = get_ssh_user()
  href = $("<a />", {href: "ssh://"+user+host , text: "SSH"})
  return href
}

function create_rdp(host) {
  user = get_windows_user()

  if (saved_data['rdp_style'] == "MS") {
    query_string_opts = []
    if (user.length > 0) query_string_opts.push("username=s:"+user)
    query_string_opts.push("full%20address=s:"+host+":3389")

    query_string = query_string_opts.join("&")
    href = $("<a />", {href: "rdp://"+query_string, text: "RDP"})
  }
  else if (saved_data['rdp_style'] == "CoRD") {
    user_at = (user.length > 0) ? user+"@" : ""
    href = $("<a />", {href: "rdp://"+user_at+host , text: "RDP"})
  }

  return href
}

function get_ssh_user() {
  default_user = saved_data['ssh_user']

  ami = get_selector(8,0).text();
  if (ami.indexOf("ubuntu") > -1)
    user = "ubuntu"
  else if (ami.indexOf("amzn") > -1)
    user = "ec2-user"
  else if (ami.indexOf("RHEL") > -1)
    user = "ec2-user"
  else if (ami.indexOf("suse-sles") > -1)
    user = "ec2-user"
  else
    user = default_user

  if (saved_data['always_override_user'])
    user = default_user

  if (user.length)
    return user + "@"
  else
    return ""
}

function get_windows_user() {
  user = saved_data['rdp_user']
  return user
}

function get_selector(row,div) {
  return $(`.gwt-TabLayoutPanelContent table > tbody tr:eq(${row}) div > div > div:eq(${div*2+1})`)
}
