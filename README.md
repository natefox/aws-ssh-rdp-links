# AWS SSH, SSM and RDP Links
https://chrome.google.com/webstore/detail/aws-ssh-rdp-links/hgholhakdlbjengncomcankfpfkjdpdh

### Adds SSH, SSM or RDP links to your AWS console

This chrome extension looks at the Platform field and if it says 'windows' then it adds RDP links to all the applicable fields that have IPs or hostnames.
Otherwise, it adds SSM to the Instance ID field and SSH links to all the IP and hostname fields.

### RDP Link Style
- **MS** uses a link like rdp://full%20address=s:HOST:3389&username=s:USER - this works for the Microsoft RDP clients. Full documentation is here: https://technet.microsoft.com/en-us/library/dn690096.aspx
- **CoRD** uses a link like rdp://USER@HOST - and is good for OSX's CoRD. Full documentation here: https://github.com/dorianj/CoRD/wiki/Command-Line-Use


### Thanks to
- stefansundin for rewriting a bunch of stuff when I didnt have time
