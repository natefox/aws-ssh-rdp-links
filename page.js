var saved_data = {}

chrome.storage.onChanged.addListener(function(){
    get_storage();
})

// I really want something like this!
// http://stackoverflow.com/a/3597640/517606
document.addEventListener('DOMContentLoaded', function() {
    $(document).click(function(){
        if (window.location.hash.startsWith("#Instances"))
            get_storage();
    })
});


function get_storage() {
    chrome.storage.sync.get(default_data, function(items){
        saved_data = items
        window.setTimeout(function(){
            go();    
        }, 400);    
    })
}

function go() {
    // private_dns = get_selector(4,0);
    private_dns = find_value("Private DNS");
    // private_ip = get_selector(5,0);
    private_ip = find_value("Private IPs");

    // public_dns = get_selector(1,1);
    public_dns = find_value("Public DNS");
    // public_ip = get_selector(2,1);
    public_ip = find_value("Public IP");
    
    // elastic_ip = get_selector(3,1);
    elastic_ip = find_value("Elastic IP");

    top_row = $("div.GMB span:eq(2)")


    add_to_field(private_ip)
    add_to_field(public_ip)
    add_to_field(elastic_ip)

    add_to_field(private_dns)
    add_to_field(public_dns)
    add_to_field(top_row, true)
}

function add_to_field(fld, is_top_row = false) {
    var field_text_arr = (is_top_row)
                            // grab last item via reverse->first item
                            ? fld.contents().first().text().split(" ").reverse()
                            : fld.contents().first().text().split(",")

    if (field_text_arr[0].indexOf("-") == 0 || field_text_arr[0].trim().length == 0)
        return

    // platform = get_selector(8,1).text();
    platform = find_value("Platform").text();

    field_text_arr.forEach(function(e,i,a){
        console.log(e,i,a)
        console.log(fld)
        var span = ($("span.awssshrdplink", fld).length)
            ? $("span.awssshrdplink", fld).empty()
            : $("<span />", {class: "awssshrdplink"})
    
        field_text=e.trim()
        var str_to_add = (platform == "windows")
                       ? create_rdp(field_text) 
                       : create_ssh(field_text)

        span.append(str_to_add)
        fld.append(span)
    })

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
    } else if (saved_data['rdp_style'] == "CoRD") {
        user_at = (user.length > 0) ? user+"@" : ""
        href = $("<a />", {href: "rdp://"+user_at+host , text: "RDP"})
    }

    return href
}

function get_ssh_user() {
    default_user = saved_data['ssh_user']

    ami = get_selector(7,1).text();
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
    return $("table.PJ > tbody tr:eq("+row+") div.BK:eq("+div+")")
}

function find_value(plaintext) {
    // $context=$("div:contains("+plaintext+")").not(["__gwt_header_row"],["__gwt_header"]).last().parent()
    $context=$("span:contains("+plaintext+")").closest("td")
    return $("div > div:eq(2)", $context)
}